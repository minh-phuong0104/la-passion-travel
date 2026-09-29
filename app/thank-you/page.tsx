import { cookies } from "next/headers";
import Link from "next/link";

import { ItineraryDownloads } from "@/components/itinerary/ItineraryDownloads";
import { IMAGES } from "@/lib/journey-config";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

type Itinerary = {
  id: string;
  title: string;
  region: string | null;
  duration: string | null;
};

function isUuid(value: string | undefined) {
  return !!(
    value &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

export default async function ThankYou() {
  const cookieStore = await cookies();
  const leadId =
    cookieStore.get("lp_recent_lead")?.value;

  let hasValidLead = false;
  let itineraries: Itinerary[] = [];

  if (isUuid(leadId)) {
    try {
      const db =
        createServiceSupabaseClient();

      const [
        leadResult,
        itineraryResult,
      ] = await Promise.all([
        db
          .from("leads")
          .select("id")
          .eq("id", leadId)
          .maybeSingle(),

        db
          .from("itineraries")
          .select(
            "id,title,region,duration",
          )
          .eq("is_active", true)
          .order("sort_order", {
            ascending: true,
          })
          .order("created_at", {
            ascending: true,
          }),
      ]);

      hasValidLead =
        !leadResult.error &&
        !!leadResult.data;

      if (
        hasValidLead &&
        !itineraryResult.error
      ) {
        itineraries =
          (itineraryResult.data ??
            []) as Itinerary[];
      }
    } catch (error) {
      console.error(
        "[thank-you] itinerary load failed",
        String(error),
      );
    }
  }

  return (
    <main
      className="
        min-h-[100dvh]
        px-5
        py-10
        text-white
        sm:px-8
        lg:py-14
      "
      style={{
        background: IMAGES.hero,
      }}
    >
      <div className="mx-auto flex min-h-[calc(100dvh-80px)] w-full max-w-5xl items-center justify-center">
        <div className="w-full text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
            La Passion Travel
          </p>

          <h1 className="mt-4 font-serif text-5xl leading-[1.02] sm:text-6xl">
            Thank you.
            <br />
            Your journey starts here.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-white/80">
            We have received your
            request. You can now choose
            one of our ready-made
            itineraries to download,
            while our team prepares
            recommendations tailored to
            you.
          </p>

          {hasValidLead ? (
            <div className="mx-auto mt-8 max-w-4xl">
              <div className="mb-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e7bd69]">
                  Download an itinerary
                </p>
                <h2 className="mt-1 font-serif text-3xl text-white">
                  Choose a journey for
                  inspiration
                </h2>
              </div>

              <ItineraryDownloads
                itineraries={itineraries}
              />
            </div>
          ) : (
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur">
              <p className="font-serif text-2xl">
                Complete the journey form
                first
              </p>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Itinerary downloads are
                available after a
                successful form
                submission.
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/journey"
              className="
                inline-flex
                items-center
                justify-center
                rounded-xl
                bg-[#d2a34a]
                px-7
                py-3.5
                font-semibold
                text-[#123c36]
                transition
                hover:bg-[#ddb15c]
              "
            >
              Start a new journey →
            </Link>

            <Link
              href="/"
              className="
                inline-flex
                items-center
                justify-center
                rounded-xl
                border
                border-white/35
                px-7
                py-3.5
                font-medium
                text-white
                transition
                hover:bg-white/10
              "
            >
              Back to home
            </Link>
          </div>

          <p className="mt-8 text-xs tracking-[.3em] text-gold">
            MORE VIETNAM
            <br />
            MORE YOU
          </p>
        </div>
      </div>
    </main>
  );
}
