import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import puppeteer from 'puppeteer';

const require = createRequire(import.meta.url);
const base = process.env.QUALITY_BASE_URL || 'http://127.0.0.1:3100';
const output = process.env.QUALITY_OUTPUT || '.tmp/quality/web';
await fs.mkdir(output, { recursive: true });
const browser = await puppeteer.launch({ headless: true });
const report = {
  environment: {
    base,
    browser: await browser.version(),
    cpuThrottle: 1,
    network: 'local HTTP, no artificial throttling',
    note: 'Local production build; this is not field Core Web Vitals.',
  },
  pages: [],
  checks: [],
};
try {
  for (const [device, width, height] of [
    ['desktop', 1440, 1000],
    ['mobile', 390, 844],
  ]) {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile: device === 'mobile' });
    await page.evaluateOnNewDocument(() => {
      window.__quality = { lcp: 0, cls: 0 };
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) window.__quality.lcp = entry.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          if (!entry.hadRecentInput) window.__quality.cls += entry.value;
      }).observe({ type: 'layout-shift', buffered: true });
    });
    const requestedRoutes = process.argv.slice(2);
    for (const route of requestedRoutes.length
      ? requestedRoutes
      : [
          '/',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/check-email',
          '/privacy',
        ]) {
      const errors = [];
      const errorListener = (error) => errors.push(error.message);
      page.on('pageerror', errorListener);
      const response = await page.goto(new URL(route, base).href, { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.fonts.ready);
      if (route === '/')
        await page.waitForFunction(
          () => !document.querySelector('[data-testid="site-entry-loader"]'),
          { timeout: 6000 },
        );
      if (route === '/')
        await page.waitForFunction(
          () =>
            [...document.querySelectorAll('#hero .lp-hero-content > *')].every(
              (n) => Number(getComputedStyle(n).opacity) >= 0.99,
            ),
          { timeout: 6000 },
        );
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
      const axe = await page.evaluate(async () =>
        window.axe.run(document, {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
          },
        }),
      );
      const state = await page.evaluate(() => ({
        ...window.__quality,
        fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null,
        ttfb: performance.getEntriesByType('navigation')[0]?.responseStart ?? null,
        overflow: document.documentElement.scrollWidth > innerWidth,
        brands: [...document.querySelectorAll('[role="img"][aria-label="Stacklyst"]')].map(
          (brand) => ({
            mark: getComputedStyle(brand.querySelector('path')).fill,
            text: brand.querySelector('span')
              ? getComputedStyle(brand.querySelector('span')).color
              : null,
            label: brand.getAttribute('aria-label'),
          }),
        ),
      }));
      await page.screenshot({
        path: path.join(output, `${device}-${route === '/' ? 'home' : route.slice(1)}.png`),
        fullPage: route !== '/',
      });
      report.pages.push({
        route,
        device,
        status: response.status(),
        ...state,
        errors,
        violations: axe.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
        })),
      });
      page.off('pageerror', errorListener);
    }
    // Keyboard focus must remain visible on the new recovery entry point.
    await page.goto(`${base}/forgot-password`, { waitUntil: 'networkidle0' });
    await page.keyboard.press('Tab');
    report.checks.push({
      name: `${device}: keyboard focus is visible`,
      passed: await page.evaluate(() => document.activeElement.matches(':focus-visible')),
    });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(base, { waitUntil: 'networkidle0' });
    report.checks.push({
      name: `${device}: reduced motion has no entry overlay`,
      passed: (await page.$('[data-testid="site-entry-loader"]')) === null,
    });
    const motion = await page.evaluate(() =>
      [...document.querySelectorAll('[role="img"][aria-label="Stacklyst"] svg')].every(
        (n) => getComputedStyle(n).animationName === 'none',
      ),
    );
    report.checks.push({
      name: `${device}: reduced motion disables logo animation`,
      passed: motion,
    });
    await page.close();
  }
  report.checks.push({
    name: 'all brand lettering matches the monogram blue',
    passed: report.pages.every((p) =>
      p.brands.every((b) => b.mark === 'rgb(0, 131, 254)' && (!b.text || b.text === b.mark)),
    ),
  });
  report.checks.push({
    name: 'no horizontal overflow',
    passed: report.pages.every((p) => !p.overflow),
  });
  report.checks.push({
    name: 'no uncaught page errors',
    passed: report.pages.every((p) => p.errors.length === 0),
  });
  report.checks.push({
    name: 'all public routes return HTTP 200',
    passed: report.pages.every((p) => p.status === 200),
  });
  report.checks.push({
    name: 'WCAG 2.2 AA axe scan: zero violations',
    passed: report.pages.every((p) => p.violations.length === 0),
  });
  report.checks.push({
    name: 'local LCP <= 2500ms',
    passed: report.pages.every((p) => p.lcp > 0 && p.lcp <= 2500),
  });
  report.checks.push({ name: 'CLS <= 0.1', passed: report.pages.every((p) => p.cls <= 0.1) });
  await fs.writeFile(path.join(output, 'web-quality.json'), JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      {
        pages: report.pages.length,
        checks: report.checks,
        metrics: report.pages.map(({ route, device, lcp, fcp, cls, violations }) => ({
          route,
          device,
          lcp: Math.round(lcp),
          fcp: Math.round(fcp),
          cls,
          violations: violations.length,
        })),
        output,
      },
      null,
      2,
    ),
  );
  if (report.checks.some((c) => !c.passed)) process.exitCode = 1;
} finally {
  await browser.close();
}
