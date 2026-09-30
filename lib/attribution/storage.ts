import type { Stored, Touch } from "./types";
import { capture, hasSignal } from "./capture";

export const KEY = "lp_attribution_v1";

function isExplicitPartnerTouch(touch: Touch) {
  const source = String(touch.source || "")
    .trim()
    .toLowerCase();
  const campaign = String(touch.campaign || "")
    .trim()
    .toLowerCase();
  const content = String(touch.content || "")
    .trim()
    .toLowerCase();

  const isPartnerPlatform =
    source === "instagram" ||
    source === "ig" ||
    source === "facebook" ||
    source === "fb";

  return (
    isPartnerPlatform &&
    campaign === "partner_referral" &&
    content.length > 0
  );
}

/**
 * First touch normally remains write-once.
 * Exception: an explicit Instagram/Facebook partner tracking link
 * becomes the attribution owner because the sales team needs the
 * exact partner account that sent the lead.
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
