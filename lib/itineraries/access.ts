import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';

export const ITINERARY_ACCESS_COOKIE = 'lp_itinerary_access';
export const ITINERARY_ACCESS_MAX_AGE = 6 * 60 * 60;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function signingKey() {
  const key =
    process.env.ITINERARY_ACCESS_SECRET ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) throw new Error('Itinerary access signing key is not configured.');
  return key;
}

function signature(payload: string) {
  return createHmac('sha256', signingKey()).update(payload).digest();
}

/** A short-lived, signed proof that this browser successfully submitted a lead. */
export function createItineraryAccessCookie(leadId: string) {
  if (!UUID.test(leadId)) throw new Error('Invalid lead ID.');
  const expiresAt = Math.floor(Date.now() / 1000) + ITINERARY_ACCESS_MAX_AGE;
  const payload = Buffer.from(`${leadId}.${expiresAt}`).toString('base64url');
  return `${payload}.${signature(payload).toString('base64url')}`;
}

export function readItineraryAccessCookie(cookieValue: string | undefined) {
  if (!cookieValue) return null;
  const [payload, suppliedSignature, extra] = cookieValue.split('.');
  if (!payload || !suppliedSignature || extra) return null;

  try {
    const expected = signature(payload);
    const supplied = Buffer.from(suppliedSignature, 'base64url');
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
      return null;
    }

    const [leadId, expiry, trailing] = Buffer.from(payload, 'base64url')
      .toString('utf8')
      .split('.');
    if (trailing || !UUID.test(leadId) || !/^\d{10}$/.test(expiry)) return null;
    if (Number(expiry) <= Math.floor(Date.now() / 1000)) return null;
    return leadId;
  } catch {
    return null;
  }
}
