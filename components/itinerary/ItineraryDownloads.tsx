"use client";

import { useState } from "react";

type Itinerary = {
  id: string;
  title: string;
  region: string | null;
  duration: string | null;
};

export function ItineraryDownloads({
  itineraries,
}: {
  itineraries: Itinerary[];
}) {
  const [loadingId, setLoadingId] =
    useState<string | null>(null);
  const [error, setError] = useState("");

  async function download(itinerary: Itinerary) {
    if (loadingId) return;

    setLoadingId(itinerary.id);
    setError("");

    const popup = window.open("about:blank", "_blank");

    if (popup) {
      popup.opener = null;
      popup.document.title = "Preparing itinerary…";
    }

    try {
      const response = await fetch("/api/itineraries/download", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          itineraryId: itinerary.id,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success || !data?.downloadUrl) {
        throw new Error(
          data?.error || "Unable to download itinerary.",
        );
      }

      if (popup) {
        popup.location.href = data.downloadUrl;
      } else {
        window.location.href = data.downloadUrl;
      }
    } catch (err) {
      popup?.close();

      setError(
        err instanceof Error
          ? err.message
          : "Unable to download itinerary.",
      );
    } finally {
      setLoadingId(null);
    }
  }

  if (!itineraries.length) {
    return (
      <div className="rounded-2xl border border-white/15 bg-white/10 px-6 py-5 text-sm text-white/80 backdrop-blur">
        We do not have a matching downloadable itinerary available yet. Our team
        will contact you with a suitable recommendation.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid gap-3">
        {itineraries.map((itinerary) => (
          <button
            key={itinerary.id}
            type="button"
            disabled={loadingId === itinerary.id}
            onClick={() => download(itinerary)}
            className="
              group
              rounded-2xl
              border
              border-[#e7bd69]/45
              bg-white/12
              p-6
              text-left
              backdrop-blur
              transition
              hover:-translate-y-0.5
              hover:border-[#e7bd69]
              hover:bg-white/16
              disabled:cursor-wait
              disabled:opacity-60
            "
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e7bd69]">
                  Best match
                </p>
                <p className="mt-2 font-serif text-2xl leading-tight text-white">
                  {itinerary.title}
                </p>

                {(itinerary.region || itinerary.duration) && (
                  <p className="mt-2 text-xs uppercase tracking-[0.12em] text-white/60">
                    {[itinerary.region, itinerary.duration]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>

              <span className="shrink-0 text-3xl text-[#d2a34a] transition group-hover:translate-y-0.5">
                ↓
              </span>
            </div>

            <p className="mt-5 text-sm font-semibold text-[#e7bd69]">
              {loadingId === itinerary.id
                ? "Preparing download…"
                : "Download your recommended PDF →"}
            </p>
          </button>
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-300/30 bg-red-950/30 px-4 py-3 text-sm text-red-100"
        >
          {error}
        </p>
      )}
    </div>
  );
}
