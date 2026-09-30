import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  recommendItineraries,
  type MatchableItinerary,
} from "@/lib/itineraries/match";
import { itineraryDownloadUrl } from "@/lib/itineraries/url";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

type DownloadableItinerary = MatchableItinerary & {
  pdf_url: string;
  is_active: boolean;
};

export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const itineraryId =
    typeof body === "object" &&
    body !== null &&
    "itineraryId" in body
      ? (body as { itineraryId?: unknown }).itineraryId
      : null;

  if (!isUuid(itineraryId)) {
    return NextResponse.json(
      { success: false, error: "Invalid itinerary." },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const leadId = cookieStore.get("lp_recent_lead")?.value;

  if (!isUuid(leadId)) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Please submit the journey form before downloading an itinerary.",
      },
      { status: 401 },
    );
  }

  try {
    const db = createServiceSupabaseClient();

    const [leadResult, itineraryResult] = await Promise.all([
      db
        .from("leads")
        .select("id,destinations,duration")
        .eq("id", leadId)
        .maybeSingle(),

      db
        .from("itineraries")
        .select(
          "id,title,region,duration,pdf_url,is_active,sort_order",
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);

    if (leadResult.error || !leadResult.data) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Your form session has expired. Please submit the form again.",
        },
        { status: 401 },
      );
    }

    if (itineraryResult.error) {
      return NextResponse.json(
        {
          success: false,
          error: "Itineraries are temporarily unavailable.",
        },
        { status: 503 },
      );
    }

    const available =
      (itineraryResult.data ?? []) as DownloadableItinerary[];

    const recommended = recommendItineraries(
      {
        destinations: leadResult.data.destinations,
        duration: leadResult.data.duration,
      },
      available,
      1,
    );

    const itinerary = recommended.find(
      (item) => item.id === itineraryId,
    );

    if (!itinerary) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This file is not the itinerary recommended for your journey.",
        },
        { status: 403 },
      );
    }

    const { error: logError } = await db
      .from("itinerary_downloads")
      .insert({
        itinerary_id: itinerary.id,
        lead_id: leadId,
      });

    if (logError) {
      console.error(
        "[itinerary-download] tracking failed",
        logError.code,
        logError.message,
      );
    }

    return NextResponse.json({
      success: true,
      downloadUrl: itineraryDownloadUrl(itinerary.pdf_url),
    });
  } catch (error) {
    console.error(
      "[itinerary-download] failed",
      String(error),
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "We could not start the download. Please try again.",
      },
      { status: 500 },
    );
  }
}
