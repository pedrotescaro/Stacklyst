const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const { createServerClient } = require('@supabase/ssr');

const repositoryRoot = path.resolve(__dirname, '../../..');
dotenv.config({ path: path.join(repositoryRoot, '.env.local'), quiet: true });

const password = process.env.STACKLYST_SCREENSHOT_PASSWORD || process.env.SEED_DEFAULT_PASSWORD;
const accountEmail = process.env.STACKLYST_SCREENSHOT_EMAIL || 'pedro@devdeck.dev';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const baseUrl = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:3000';
const outputDirectory = path.join(
  repositoryRoot,
  'docs',
  'laboratorio-engenharia-software',
  'prototipos',
  'atuais'
);

const captures = [
  {
    route: '/profile/pedrodev',
    file: 'uc003-uc007-perfil-progresso-atual.png',
  },
  { route: '/trails', file: 'uc004-trilhas-atual.png' },
  { route: '/duels', file: 'uc008-uc009-duelos-atual.png' },
  { route: '/ranking', file: 'uc011-ranking-atual.png' },
  {
    route: '/feed',
    file: 'uc013-uc014-feed-atual.png',
    readySelector: '[data-testid="primary-column"] article:not(.dd-skeleton-post)',
  },
];

async function waitForStablePage(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
  await page.locator('main').first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined);
  await page.waitForTimeout(1_500);
}

async function main() {
  fs.mkdirSync(outputDirectory, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    locale: 'pt-BR',
  });
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(120_000);
  let temporaryAuthClient = null;

  try {
    if (password) {
      await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
      await page.waitForTimeout(750);
      await page.locator('#email').fill(accountEmail);
      await page.locator('#password').fill(password);
      await page.getByRole('button', { name: 'Sign in', exact: true }).click();
      try {
        await page.waitForURL((url) => url.pathname === '/feed', { timeout: 30_000 });
      } catch {
        const alert = page.getByRole('alert');
        const message = (await alert.count()) > 0 ? await alert.first().innerText() : '';
        throw new Error(message || 'The development account could not open the authenticated feed.');
      }
    } else {
      if (!supabaseUrl || !serviceRoleKey || !publicKey) {
        throw new Error('Supabase admin configuration is unavailable.');
      }

      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: accountEmail,
        options: { redirectTo: `${baseUrl}/api/auth/callback?next=/feed` },
      });

      if (error || !data?.properties?.hashed_token) {
        throw new Error(error?.message || 'Could not generate a temporary development session.');
      }

      const cookieJar = new Map();
      temporaryAuthClient = createServerClient(supabaseUrl, publicKey, {
        cookies: {
          getAll() {
            return Array.from(cookieJar.values());
          },
          setAll(cookiesToSet) {
            for (const cookie of cookiesToSet) cookieJar.set(cookie.name, cookie);
          },
        },
      });
      const { data: sessionData, error: verifyError } = await temporaryAuthClient.auth.verifyOtp({
        token_hash: data.properties.hashed_token,
        type: 'email',
      });

      if (verifyError || !sessionData.session) {
        throw new Error(verifyError?.message || 'Could not establish the temporary session.');
      }
      await new Promise((resolve) => setTimeout(resolve, 100));

      const browserCookies = Array.from(cookieJar.values())
        .filter((cookie) => cookie.value)
        .map(({ name, value, options = {} }) => ({
          name,
          value,
          url: baseUrl,
          httpOnly: Boolean(options.httpOnly),
          secure: Boolean(options.secure),
          sameSite:
            options.sameSite === 'strict'
              ? 'Strict'
              : options.sameSite === 'none'
                ? 'None'
                : 'Lax',
          ...(options.maxAge
            ? { expires: Math.floor(Date.now() / 1000) + Number(options.maxAge) }
            : {}),
        }));
      await context.addCookies(browserCookies);
      const storedCookieNames = (await context.cookies(baseUrl)).map((cookie) => cookie.name);
      if (storedCookieNames.length === 0) {
        throw new Error('The temporary session did not create browser cookies.');
      }
      console.log('Temporary authenticated session established.');
    }

    const onlyRoutes = new Set(
      (process.env.SCREENSHOT_ONLY || '')
        .split(',')
        .map((route) => route.trim())
        .filter(Boolean)
    );
    const selectedCaptures = onlyRoutes.size
      ? captures.filter((capture) => onlyRoutes.has(capture.route))
      : captures;

    for (const capture of selectedCaptures) {
      await page.goto(`${baseUrl}${capture.route}`, {
        waitUntil: 'domcontentloaded',
        timeout: 120_000,
      });
      await waitForStablePage(page);

      const currentUrl = new URL(page.url());
      if (currentUrl.pathname === '/login') {
        throw new Error(`Authentication was lost while opening ${capture.route}.`);
      }
      if (capture.readySelector) {
        await page.locator(capture.readySelector).first().waitFor({
          state: 'visible',
          timeout: 60_000,
        });
        await page.waitForTimeout(1_000);
      }

      await page.screenshot({
        path: path.join(outputDirectory, capture.file),
        fullPage: false,
        animations: 'disabled',
      });
      console.log(`${capture.route} -> ${capture.file}`);
    }
  } finally {
    if (temporaryAuthClient) {
      await temporaryAuthClient.auth.signOut({ scope: 'local' }).catch(() => undefined);
    }
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
