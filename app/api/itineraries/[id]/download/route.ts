import { NextRequest, NextResponse } from 'next/server';

import {
  ITINERARY_ACCESS_COOKIE,
  readItineraryAccessCookie,
} from '@/lib/itineraries/access';
import {
  createItineraryServiceClient,
  getItineraryFileUrl,
  type ItineraryFile,
} from '@/lib/itineraries/server';

export const runtime = 'nodejs';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const fail = (message: string, status: number) =>
  NextResponse.json(
    { error: message },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!UUID.test(id)) return fail('Itinerary not found.', 404);

  const leadId = readItineraryAccessCookie(
    request.cookies.get(ITINERARY_ACCESS_COOKIE)?.value,
  );
  if (!leadId) return fail('Please complete the journey form first.', 401);

  const db = createItineraryServiceClient();
  if (!db) return fail('Download is temporarily unavailable.', 503);

  const [leadResult, itineraryResult] = await Promise.all([
    db.from('leads').select('id').eq('id', leadId).maybeSingle(),
    db.from('itineraries')
      .select('id,source_type,drive_file_id,storage_path')
      .eq('id', id)
      .eq('is_published', true)
      .maybeSingle(),
  ]);

  if (leadResult.error || itineraryResult.error) {
    console.error(
      '[itineraries] download lookup failed',
      leadResult.error?.code,
      itineraryResult.error?.code,
    );
    return fail('Download is temporarily unavailable.', 503);
  }
  if (!leadResult.data) return fail('Please complete the journey form first.', 401);
  if (!itineraryResult.data) return fail('Itinerary not found.', 404);

  const url = getItineraryFileUrl(itineraryResult.data as ItineraryFile, db);
  if (!url) return fail('This PDF is temporarily unavailable.', 503);

  const { error: trackingError } = await db.from('itinerary_downloads').insert({
    lead_id: leadId,
    itinerary_id: id,
  });
  if (trackingError) {
    console.error('[itineraries] download tracking failed', trackingError.code);
  }

  const response = NextResponse.redirect(url, 302);
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}
