import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionToken, verifySessionToken, passwordMatches, isAdmin, sessionCookie, SESSION_COOKIE, SESSION_TTL_SECONDS } from '../lib/admin-auth.mjs';

const password = 'mot-de-passe-test-local';
const withCookie = (token) => new Request('https://site.test/admin', { headers: { cookie: `autre=1; ${SESSION_COOKIE}=${token}` } });

test('Mot de passe : correct accepté, incorrect ou non configuré refusé', async () => {
  assert.equal(await passwordMatches(password, password), true);
  assert.equal(await passwordMatches(password + 'x', password), false);
  assert.equal(await passwordMatches('', password), false);
  assert.equal(await passwordMatches(null, password), false);
  assert.equal(await passwordMatches('court', 'court'), false, 'un mot de passe trop court n’est jamais accepté');
  assert.equal(await passwordMatches('', undefined), false, 'aucun accès si le secret est absent');
});

test('Session signée : valide, falsifiée, expirée, ou après changement de mot de passe', async () => {
  const now = Date.now();
  const token = await createSessionToken(password, now);
  assert.equal(await verifySessionToken(token, password, now), true);
  assert.equal(await isAdmin(withCookie(token), password), true);
  const [v, expiry, signature] = token.split('.');
  assert.equal(await verifySessionToken(`${v}.${Number(expiry) + 1000}.${signature}`, password, now), false, 'prolonger l’expiration invalide la signature');
  assert.equal(await verifySessionToken(token, password, now + (SESSION_TTL_SECONDS + 1) * 1000), false, 'session expirée');
  assert.equal(await verifySessionToken(token, 'autre-mot-de-passe-long', now), false, 'changer le mot de passe déconnecte');
  assert.equal(await isAdmin(new Request('https://site.test/admin'), password), false);
});

test('Cookie de session HttpOnly, Secure, SameSite=Strict', async () => {
  const cookie = sessionCookie(await createSessionToken(password));
  for (const part of ['HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/']) assert.ok(cookie.includes(part), part);
  assert.ok(cookie.startsWith('__Host-'));
});
