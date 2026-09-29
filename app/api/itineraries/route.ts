import { NextResponse } from "next/server";

import { createServiceSupabaseClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const db = createServiceSupabaseClient();

    const { data, error } = await db
      .from("itineraries")
      .select("id,title,region,duration")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error(
        "[itineraries] list failed",
        error.code,
        error.message,
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to load itineraries.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      itineraries: data ?? [],
    });
  } catch (error) {
    console.error(
      "[itineraries] list failed",
      String(error),
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load itineraries.",
      },
      { status: 500 },
    );
  }
}
