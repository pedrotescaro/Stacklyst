const fs = require('node:fs');
const path = require('node:path');
const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const { createServerClient } = require('@supabase/ssr');

const repositoryRoot = path.resolve(__dirname, '../../..');
dotenv.config({ path: path.join(repositoryRoot, '.env.local'), quiet: true });

const accountEmail = process.env.STACKLYST_SCREENSHOT_EMAIL || 'pedro@devdeck.dev';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const publicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const baseUrl = process.env.SCREENSHOT_BASE_URL || 'http://localhost:3000';
const outputDirectory = path.join(
  repositoryRoot,
  'docs',
  'laboratorio-engenharia-software',
  'prototipos',
  'atuais'
);

const captures = [
  { role: 'RECRUITER', route: '/recruiter', file: 'uc017-uc025-recrutador-atual.png' },
  { role: 'EVALUATOR', route: '/evaluations', file: 'uc016-uc027-avaliador-atual.png' },
];

async function main() {
  if (!supabaseUrl || !serviceRoleKey || !publicKey) {
    throw new Error('Supabase admin configuration is unavailable.');
  }
  fs.mkdirSync(outputDirectory, { recursive: true });

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const cookieJar = new Map();
  const authClient = createServerClient(supabaseUrl, publicKey, {
    cookies: {
      getAll: () => Array.from(cookieJar.values()),
      setAll: (cookies) => cookies.forEach((cookie) => cookieJar.set(cookie.name, cookie)),
    },
  });
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: accountEmail,
    options: { redirectTo: `${baseUrl}/api/auth/callback?next=/feed` },
  });
  if (linkError || !linkData?.properties?.hashed_token) {
    throw new Error(linkError?.message || 'Could not create temporary screenshot session.');
  }
  const { data: sessionData, error: verifyError } = await authClient.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'email',
  });
  if (verifyError || !sessionData.session) {
    throw new Error(verifyError?.message || 'Could not verify temporary screenshot session.');
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 1 });
  const cookies = Array.from(cookieJar.values())
    .filter((cookie) => cookie.value)
    .map(({ name, value, options = {} }) => ({
      name,
      value,
      url: baseUrl,
      httpOnly: Boolean(options.httpOnly),
      secure: Boolean(options.secure),
      sameSite: options.sameSite === 'strict' ? 'Strict' : options.sameSite === 'none' ? 'None' : 'Lax',
      ...(options.maxAge
        ? { expires: Math.floor(Date.now() / 1000) + Number(options.maxAge) }
        : {}),
    }));
  await page.setCookie(...cookies);

  try {
    for (const capture of captures) {
      await page.setCookie({
        name: 'stacklyst-screenshot-role',
        value: capture.role,
        url: baseUrl,
        httpOnly: true,
        sameSite: 'Lax',
      });

      await page.goto(`${baseUrl}${capture.route}`, {
        waitUntil: 'networkidle2',
        timeout: 120_000,
      });
      await page.waitForSelector('main', { visible: true, timeout: 30_000 });
      await page.screenshot({
        path: path.join(outputDirectory, capture.file),
        fullPage: false,
      });
      console.log(`${capture.role} ${capture.route} -> ${capture.file}`);
    }
  } finally {
    await authClient.auth.signOut({ scope: 'local' }).catch(() => undefined);
    await browser.close();
    console.log('Temporary screenshot role removed with the browser session.');
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
