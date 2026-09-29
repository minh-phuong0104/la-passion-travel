"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireStaff } from "@/lib/auth/require-staff";

function value(
  formData: FormData,
  key: string,
  max = 500,
) {
  return String(
    formData.get(key) ?? "",
  )
    .trim()
    .slice(0, max);
}

function integer(
  formData: FormData,
  key: string,
) {
  const parsed = Number(
    formData.get(key),
  );

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(
    -9999,
    Math.min(
      9999,
      Math.trunc(parsed),
    ),
  );
}

function isHttpUrl(raw: string) {
  try {
    const url = new URL(raw);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

async function requireAdmin() {
  const context =
    await requireStaff();

  if (
    context.profile.role !==
    "admin"
  ) {
    redirect(
      "/admin/itineraries?error=admin-only",
    );
  }

  return context;
}

export async function createItinerary(
  formData: FormData,
) {
  const { supabase } =
    await requireAdmin();

  const title = value(
    formData,
    "title",
    160,
  );

  const region = value(
    formData,
    "region",
    120,
  );

  const duration = value(
    formData,
    "duration",
    80,
  );

  const pdfUrl = value(
    formData,
    "pdf_url",
    1200,
  );

  const sortOrder = integer(
    formData,
    "sort_order",
  );

  if (
    !title ||
    !isHttpUrl(pdfUrl)
  ) {
    redirect(
      "/admin/itineraries?error=invalid",
    );
  }

  const { error } = await supabase
    .from("itineraries")
    .insert({
      title,
      region: region || null,
      duration:
        duration || null,
      pdf_url: pdfUrl,
      sort_order: sortOrder,
      is_active: true,
    });

  if (error) {
    console.error(
      "[admin itineraries] create failed",
      error.code,
      error.message,
    );

    redirect(
      "/admin/itineraries?error=save",
    );
  }

  revalidatePath(
    "/admin/itineraries",
  );

  revalidatePath(
    "/thank-you",
  );
}

export async function updateItinerary(
  formData: FormData,
) {
  const { supabase } =
    await requireAdmin();

  const id = value(
    formData,
    "id",
    64,
  );

  const title = value(
    formData,
    "title",
    160,
  );

  const region = value(
    formData,
    "region",
    120,
  );

  const duration = value(
    formData,
    "duration",
    80,
  );

  const pdfUrl = value(
    formData,
    "pdf_url",
    1200,
  );

  const sortOrder = integer(
    formData,
    "sort_order",
  );

  const isActive =
    formData.get(
      "is_active",
    ) === "on";

  if (
    !id ||
    !title ||
    !isHttpUrl(pdfUrl)
  ) {
    redirect(
      "/admin/itineraries?error=invalid",
    );
  }

  const { error } = await supabase
    .from("itineraries")
    .update({
      title,
      region: region || null,
      duration:
        duration || null,
      pdf_url: pdfUrl,
      sort_order: sortOrder,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) {
    console.error(
      "[admin itineraries] update failed",
      error.code,
      error.message,
    );

    redirect(
      "/admin/itineraries?error=save",
    );
  }

  revalidatePath(
    "/admin/itineraries",
  );

  revalidatePath(
    "/thank-you",
  );
}

export async function deleteItinerary(
  formData: FormData,
) {
  const { supabase } =
    await requireAdmin();

  const id = value(
    formData,
    "id",
    64,
  );

  if (!id) {
    return;
  }

  const { error } = await supabase
    .from("itineraries")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(
      "[admin itineraries] delete failed",
      error.code,
      error.message,
    );

    redirect(
      "/admin/itineraries?error=delete",
    );
  }

  revalidatePath(
    "/admin/itineraries",
  );

  revalidatePath(
    "/thank-you",
  );
}
