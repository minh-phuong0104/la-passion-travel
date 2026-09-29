import { classify } from '@/lib/attribution/classify';
import type { Touch } from '@/lib/attribution/types';

export type Payload = {
  submissionId: string;
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  consent: boolean;
  destinations: string[];
  duration: string;
  travelDate: string;
  customDuration: string;
  companion: string;
  travelerCount: number;
  experiences: string[];
  pace: string;
  budget: string;
  specialRequests: string;
  firstTouch: Touch;
  lastTouch: Touch;
};

const s = (v: unknown, m = 200) =>
  typeof v === 'string'
    ? v.trim().replace(/[\u0000-\u001f]/g, ' ').slice(0, m)
    : '';

const arr = (v: unknown) =>
  Array.isArray(v)
    ? v.map((x) => s(x, 80)).filter(Boolean).slice(0, 20)
    : [];

const K: (keyof Touch)[] = [
  'source',
  'medium',
  'campaign',
  'content',
  'term',
  'referrer',
  'landingPage',
  'timestamp',
  'fbclid',
  'gclid',
  'wbraid',
  'gbraid',
  'ttclid',
];

const touch = (v: any): Touch =>
  Object.fromEntries(K.map((k) => [k, s(v?.[k], 500)])) as Touch;

export function normalize(b: any): Payload {
  return {
    submissionId: s(b?.submissionId, 64),
    fullName: s(b?.fullName, 120),
    email: s(b?.email, 160).toLowerCase(),
    phone: s(b?.phone, 30),
    countryCode: s(b?.countryCode, 6) || '+84',
    consent: b?.consent === true,
    destinations: arr(b?.destinations),
    duration: s(b?.duration, 40),
    travelDate: s(b?.travelDate, 20),
    customDuration: s(b?.customDuration, 40),
    companion: s(b?.companion, 40),
    travelerCount: Math.min(
      500,
      Math.max(1, Math.floor(Number(b?.travelerCount)) || 1),
    ),
    experiences: arr(b?.experiences),
    pace: s(b?.pace, 40),
    budget: s(b?.budget, 60),
    specialRequests: s(b?.specialRequests, 500),
    firstTouch: touch(b?.firstTouch),
    lastTouch: touch(b?.lastTouch),
  };
}

export function validateLead(p: Payload) {
  const e: Record<string, string> = {};
  const digits = p.phone.replace(/\D/g, '');

  if (p.fullName.length < 2) {
    e.fullName = 'Please enter your full name.';
  }

  // WhatsApp is optional. If supplied, it still has to look valid.
  if (
    digits.length > 0 &&
    (digits.length < 7 ||
      digits.length > 15 ||
      /^(\d)\1+$/.test(digits))
  ) {
    e.phone = 'Please enter a valid WhatsApp number.';
  }

  if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.email)) {
    e.email = 'Please enter a valid email address.';
  }

  // Keep at least one usable contact method.
  if (!p.email && digits.length === 0) {
    e.email = 'Please enter an email or WhatsApp number.';
  }

  if (digits.length > 0 && !/^\+\d{1,4}$/.test(p.countryCode)) {
    e.countryCode = 'Please select a valid country calling code.';
  }

  if (!p.consent) {
    e.consent = 'Please agree to be contacted.';
  }

  if (p.submissionId.length < 8) {
    e.submissionId = 'Submission ID is missing.';
  }

  return e;
}

export const classifyPayload = (p: Payload) => classify(p.firstTouch);
