// Admin authentication for the Cositel dashboard.
//
// The manager signs in with the ADMIN_PASSWORD secret (set with
// `wrangler secret put ADMIN_PASSWORD`). A successful sign-in sets a signed,
// HttpOnly session cookie. Identity headers sent by the browser are never trusted.

export const SESSION_COOKIE = '__Host-cositel_admin';
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
export const MIN_PASSWORD_LENGTH = 12;

const encoder = new TextEncoder();

function base64url(bytes) {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function usablePassword(password) {
  return typeof password === 'string' && password.length >= MIN_PASSWORD_LENGTH;
}

// The signing key is derived from the password, so changing the password
// signs out every existing session.
async function signingKey(password) {
  const material = await crypto.subtle.digest('SHA-256', encoder.encode('cositel-admin-session-v1|' + password));
  return crypto.subtle.importKey('raw', material, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function sign(password, payload) {
  const key = await signingKey(password);
  return base64url(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));
}

function constantTimeEqual(a, b) {
  const left = encoder.encode(a), right = encoder.encode(b);
  let diff = left.length ^ right.length;
  for (let i = 0; i < Math.max(left.length, right.length); i++) diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  return diff === 0;
}

export async function passwordMatches(candidate, password) {
  if (!usablePassword(password) || typeof candidate !== 'string' || candidate.length > 512) return false;
  // Compare fixed-length digests so the comparison time does not depend on the input.
  const [a, b] = await Promise.all([candidate, password].map((value) => crypto.subtle.digest('SHA-256', encoder.encode(value))));
  return constantTimeEqual(base64url(a), base64url(b));
}

export async function createSessionToken(password, now = Date.now()) {
  if (!usablePassword(password)) throw new Error('ADMIN_PASSWORD is missing or too short.');
  const payload = 'v1.' + (Math.floor(now / 1000) + SESSION_TTL_SECONDS);
  return payload + '.' + (await sign(password, payload));
}

export async function verifySessionToken(token, password, now = Date.now()) {
  if (!usablePassword(password) || typeof token !== 'string') return false;
  const match = /^(v1\.(\d{1,12}))\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!match) return false;
  if (Number(match[2]) <= Math.floor(now / 1000)) return false;
  return constantTimeEqual(match[3], await sign(password, match[1]));
}

export function readCookie(request, name) {
  for (const part of (request.headers.get('cookie') || '').split(';')) {
    const index = part.indexOf('=');
    if (index > 0 && part.slice(0, index).trim() === name) return part.slice(index + 1).trim();
  }
  return null;
}

export async function isAdmin(request, password) {
  return verifySessionToken(readCookie(request, SESSION_COOKIE), password);
}

export function sessionCookie(token) {
  return `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}

export function clearedSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}
