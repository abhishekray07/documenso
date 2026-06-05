// Opslane auth recipe: mint a Documenso session without driving the login UI.
// Runs inside the booted sandbox. The verifier passes credentials/base URL in
// env and reads the Playwright storageState JSON from OPSLANE_SESSION_OUT.

const fs = require('fs');

const BASE = process.env.OPSLANE_BASE_URL || 'http://localhost:3000';
const EMAIL = process.env.OPSLANE_AUTH_EMAIL;
const PASSWORD = process.env.OPSLANE_AUTH_PASSWORD;
const OUT = process.env.OPSLANE_SESSION_OUT || '/home/user/opslane-storage-state.json';

if (!EMAIL || !PASSWORD) {
  console.error('MINT_FAIL: missing OPSLANE_AUTH_EMAIL or OPSLANE_AUTH_PASSWORD');
  process.exit(1);
}

const jar = {};

function store(setCookies) {
  for (const cookie of setCookies || []) {
    const [pair] = cookie.split(';');
    const separator = pair.indexOf('=');
    if (separator > 0) {
      jar[pair.slice(0, separator).trim()] = pair.slice(separator + 1).trim();
    }
  }
}

function cookieHeader() {
  return Object.entries(jar).map(([name, value]) => `${name}=${value}`).join('; ');
}

async function main() {
  const csrfResponse = await fetch(`${BASE}/api/auth/csrf`, {
    headers: { cookie: cookieHeader() },
  });
  store(csrfResponse.headers.getSetCookie());

  const csrfToken = await csrfResponse.json().then((json) => json.csrfToken).catch(() => null);
  if (!csrfToken) {
    console.error('MINT_FAIL: no csrfToken from /api/auth/csrf');
    process.exit(1);
  }

  const loginResponse = await fetch(`${BASE}/api/auth/email-password/authorize`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: cookieHeader(),
    },
    body: JSON.stringify({
      email: EMAIL,
      password: PASSWORD,
      csrfToken,
      captchaToken: '',
    }),
  });
  store(loginResponse.headers.getSetCookie());

  if (!loginResponse.ok) {
    console.error('MINT_FAIL: login', loginResponse.status, (await loginResponse.text()).slice(0, 300));
    process.exit(1);
  }

  const cookies = Object.entries(jar).map(([name, value]) => ({
    name,
    value,
    domain: 'localhost',
    path: '/',
    expires: -1,
    httpOnly: false,
    secure: false,
    sameSite: 'Lax',
  }));

  if (cookies.length === 0) {
    console.error('MINT_FAIL: no cookies captured');
    process.exit(1);
  }

  fs.writeFileSync(OUT, JSON.stringify({ cookies, origins: [] }));
  console.log(`MINT_OK cookies=${cookies.length}`);
}

main().catch((error) => {
  console.error('MINT_ERROR:', error && error.message ? error.message : error);
  process.exit(1);
});
