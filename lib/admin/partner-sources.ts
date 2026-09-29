export const PARTNER_SOURCES = [
  { key: "vietnammoment", label: "Vietnammoment" },
  { key: "vietnam_by_local", label: "Vietnam By Local" },
  { key: "vietnam_foodie", label: "Vietnam Foodie" },
  { key: "vietnam_sip_n_eat", label: "Vietnam Sip n Eat" },
  { key: "la_passion_travel", label: "La Passion Travel" },
] as const;

export type PartnerSourceKey =
  (typeof PARTNER_SOURCES)[number]["key"];

const partnerMap = new Map(
  PARTNER_SOURCES.map((item) => [item.key, item.label]),
);

function clean(value: string | null | undefined) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function normalizePlatform(
  source: string | null | undefined,
  trafficChannel?: string | null,
) {
  const value = clean(source);

  if (value === "instagram" || value === "ig") {
    return "Instagram";
  }

  if (value === "facebook" || value === "fb") {
    return "Facebook";
  }

  if (value === "gfi") {
    return "GFI";
  }

  if (value) {
    return value
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  const channel = clean(trafficChannel);

  if (channel.includes("instagram")) return "Instagram";
  if (channel.includes("facebook")) return "Facebook";
  if (channel.includes("meta")) return "Meta";

  return channel
    ? channel
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "Direct";
}

export function partnerLabel(
  content: string | null | undefined,
) {
  const key = clean(content);

  if (!key) return null;

  const known = partnerMap.get(
    key as PartnerSourceKey,
  );

  if (known) return known;

  return key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function sourceDisplay(input: {
  source?: string | null;
  content?: string | null;
  trafficChannel?: string | null;
}) {
  return {
    platform: normalizePlatform(
      input.source,
      input.trafficChannel,
    ),
    partner: partnerLabel(input.content),
  };
}
