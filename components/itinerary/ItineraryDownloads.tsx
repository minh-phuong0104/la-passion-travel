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

  const [error, setError] =
    useState("");

  async function download(
    itinerary: Itinerary,
  ) {
    if (loadingId) return;

    setLoadingId(itinerary.id);
    setError("");

    const popup =
      window.open(
        "about:blank",
        "_blank",
      );

    if (popup) {
      popup.opener = null;
      popup.document.title =
        "Preparing itinerary…";
    }

    try {
      const response = await fetch(
        "/api/itineraries/download",
        {
          method: "POST",
          headers: {
            "content-type":
              "application/json",
          },
          body: JSON.stringify({
            itineraryId: itinerary.id,
          }),
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (
        !response.ok ||
        !data?.success ||
        !data?.downloadUrl
      ) {
        throw new Error(
          data?.error ||
            "Unable to download itinerary.",
        );
      }

      if (popup) {
        popup.location.href =
          data.downloadUrl;
      } else {
        window.location.href =
          data.downloadUrl;
      }
    } catch (err) {
      if (popup) {
        popup.close();
      }

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
        Our downloadable itineraries are
        being updated. Our team will
        still contact you about your
        journey.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid gap-3 sm:grid-cols-2">
        {itineraries.map(
          (itinerary) => (
            <button
              key={itinerary.id}
              type="button"
              disabled={
                loadingId ===
                itinerary.id
              }
              onClick={() =>
                download(itinerary)
              }
              className="
                group
                rounded-2xl
                border
                border-white/20
                bg-white/10
                p-5
                text-left
                backdrop-blur
                transition
                hover:-translate-y-0.5
                hover:border-[#d2a34a]/70
                hover:bg-white/15
                disabled:cursor-wait
                disabled:opacity-60
              "
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-serif text-xl leading-tight text-white">
                    {itinerary.title}
                  </p>

                  {(itinerary.region ||
                    itinerary.duration) && (
                    <p className="mt-2 text-xs uppercase tracking-[0.12em] text-white/60">
                      {[
                        itinerary.region,
                        itinerary.duration,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>

                <span
                  className="
                    shrink-0
                    text-2xl
                    text-[#d2a34a]
                    transition
                    group-hover:translate-y-0.5
                  "
                >
                  ↓
                </span>
              </div>

              <p className="mt-4 text-sm font-semibold text-[#e7bd69]">
                {loadingId ===
                itinerary.id
                  ? "Preparing download…"
                  : "Download PDF →"}
              </p>
            </button>
          ),
        )}
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
