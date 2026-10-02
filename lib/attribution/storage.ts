import type { Stored, Touch } from "./types";
import { capture, hasSignal } from "./capture";

export const KEY = "lp_attribution_v1";

const PARTNER_KEYS = new Set([
  "vietnammoment",
  "vietnam_by_local",
  "vietnam_foodie",
  "vietnam_sip_n_eat",
  "la_passion_travel",
]);

function clean(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

/**
 * A link is considered an explicit partner-tracking link when:
 * - the platform is Instagram/Facebook, and
 * - utm_content is one of the known partner-account keys.
 *
 * This intentionally works for bio links, posts, stories and auto-DM links.
 * The exact medium/campaign can therefore be "social", "dm",
 * "partner_referral", "auto_message", etc.
 */
function isExplicitPartnerTouch(touch: Touch) {
  const source = clean(touch.source);
  const content = clean(touch.content);

  const isPartnerPlatform =
    source === "instagram" ||
    source === "ig" ||
    source === "facebook" ||
    source === "fb";

  return (
    isPartnerPlatform &&
    PARTNER_KEYS.has(content)
  );
}

/**
 * First touch normally remains write-once.
 *
 * Exception:
 * an explicit Instagram/Facebook partner link becomes the attribution owner.
 * This prevents an older Zalo/referral/direct touch in localStorage from
 * masking the account that actually sent the customer through the tracked link.
 */
export function merge(
  stored: Stored | null,
  incoming: Touch,
): Stored {
  if (!stored || isExplicitPartnerTouch(incoming)) {
    return {
      v: 1,
      firstTouch: incoming,
      lastTouch: incoming,
    };
  }

  return {
    v: 1,
    firstTouch: stored.firstTouch,
    lastTouch: hasSignal(incoming)
      ? incoming
      : stored.lastTouch,
  };
}

export function load(): Stored | null {
  try {
    const stored = JSON.parse(
      localStorage.getItem(KEY) || "null",
    );

    return stored?.v === 1 ? stored : null;
  } catch {
    return null;
  }
}

export function initAttribution(): Stored {
  const merged = merge(
    load(),
    capture(location.href, document.referrer),
  );

  try {
    localStorage.setItem(
      KEY,
      JSON.stringify(merged),
    );
  } catch {}

  return merged;
}
