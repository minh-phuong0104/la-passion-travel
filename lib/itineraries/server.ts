import 'server-only';

import { createClient } from '@supabase/supabase-js';

export const ITINERARY_BUCKET = 'itineraries';

export type ItineraryFile = {
  source_type: 'drive' | 'upload';
  drive_file_id: string | null;
  storage_path: string | null;
};

export function createItineraryServiceClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Only configured Drive files and files in our storage bucket can be opened. */
export function getItineraryFileUrl(
  itinerary: ItineraryFile,
  db: NonNullable<ReturnType<typeof createItineraryServiceClient>>,
) {
  if (itinerary.source_type === 'drive') {
    const id = itinerary.drive_file_id;
    if (!id || !/^[a-zA-Z0-9_-]{10,}$/.test(id)) return null;
    return `https://drive.google.com/file/d/${id}/view`;
  }

  if (itinerary.source_type === 'upload') {
    const path = itinerary.storage_path;
    if (!path || path.startsWith('/') || path.split('/').includes('..')) return null;
    const { data } = db.storage.from(ITINERARY_BUCKET).getPublicUrl(path, {
      download: true,
    });
    return data.publicUrl;
  }

  return null;
}
