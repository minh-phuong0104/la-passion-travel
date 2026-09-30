type LeadForMatch = {
  destinations: unknown;
  duration: string | null;
};

export type MatchableItinerary = {
  id: string;
  title: string;
  region: string | null;
  duration: string | null;
  sort_order?: number | null;
};

const DESTINATION_TERMS: Record<string, string[]> = {
  "northern vietnam": [
    "north",
    "northern",
    "hanoi",
    "ha long",
    "halong",
    "sapa",
    "ninh binh",
  ],
  "central vietnam": [
    "central",
    "da nang",
    "danang",
    "hoi an",
    "hue",
    "quy nhon",
  ],
  "northwestern vietnam": [
    "northwest",
    "northwestern",
    "ha giang",
    "moc chau",
    "dien bien",
  ],
  "southern vietnam": [
    "south",
    "southern",
    "ho chi minh",
    "saigon",
    "phu quoc",
    "can tho",
    "con dao",
  ],
  "across vietnam": [
    "across",
    "north to south",
    "complete vietnam",
    "classic vietnam",
    "vietnam grand",
    "vietnam highlights",
  ],
};

function clean(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function destinationList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).trim())
          .filter(Boolean);
      }
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function requestedDurationRange(value: string | null) {
  const normalized = String(value ?? "").replace(/–/g, "-");

  const range = normalized.match(/(\d+)\s*-\s*(\d+)/);
  if (range) {
    return {
      min: Number(range[1]),
      max: Number(range[2]),
    };
  }

  const plus = normalized.match(/(\d+)\s*\+/);
  if (plus) {
    return {
      min: Number(plus[1]),
      max: 99,
    };
  }

  const single = normalized.match(/(\d+)/);
  if (single) {
    const days = Number(single[1]);
    return {
      min: days,
      max: days,
    };
  }

  return null;
}

function itineraryDays(itinerary: MatchableItinerary) {
  const text = `${itinerary.duration ?? ""} ${itinerary.title}`;

  const dayWord = text.match(/(\d+)\s*[- ]?\s*day/i);
  if (dayWord) return Number(dayWord[1]);

  const compact = text.match(/\b(\d+)\s*d(?:\d+\s*n)?\b/i);
  if (compact) return Number(compact[1]);

  const firstNumber = text.match(/\b(\d{1,2})\b/);
  return firstNumber ? Number(firstNumber[1]) : null;
}

function scoreItinerary(
  lead: LeadForMatch,
  itinerary: MatchableItinerary,
) {
  const destinations = destinationList(lead.destinations);
  const haystack = clean(
    `${itinerary.title} ${itinerary.region ?? ""}`,
  );

  let score = 0;

  for (const rawDestination of destinations) {
    const destination = clean(rawDestination);
    const terms =
      DESTINATION_TERMS[destination] ??
      destination.split(" ").filter((term) => term.length > 3);

    if (
      destination &&
      (haystack.includes(destination) ||
        terms.some((term) => haystack.includes(clean(term))))
    ) {
      score += 8;
    }
  }

  const requestedRange = requestedDurationRange(lead.duration);
  const days = itineraryDays(itinerary);

  if (requestedRange && days !== null) {
    if (days >= requestedRange.min && days <= requestedRange.max) {
      score += 6;
    } else {
      const distance =
        days < requestedRange.min
          ? requestedRange.min - days
          : days - requestedRange.max;

      if (distance <= 2) score += 3;
      else if (distance <= 4) score += 1;
    }
  }

  return score;
}

export function recommendItineraries<T extends MatchableItinerary>(
  lead: LeadForMatch,
  itineraries: T[],
  limit = 1,
): T[] {
  if (!itineraries.length) return [];

  return itineraries
    .map((itinerary, index) => ({
      itinerary,
      index,
      score: scoreItinerary(lead, itinerary),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;

      const aOrder = a.itinerary.sort_order ?? 0;
      const bOrder = b.itinerary.sort_order ?? 0;

      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.index - b.index;
    })
    .slice(0, Math.max(1, limit))
    .map((item) => item.itinerary);
}
