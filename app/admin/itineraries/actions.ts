"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireStaff } from "@/lib/auth/require-staff";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

const BUCKET = "itineraries";
const MAX_PDF_BYTES = 25 * 1024 * 1024;

function value(
  formData: FormData,
  key: string,
  max = 500,
) {
  return String(formData.get(key) ?? "")
    .trim()
    .slice(0, max);
}

function integer(
  formData: FormData,
  key: string,
) {
  const parsed = Number(formData.get(key));

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(
    -9999,
    Math.min(9999, Math.trunc(parsed)),
  );
}

function safeFileName(name: string) {
  const base =
    name
      .normalize("NFKD")
      .replace(/[^\w.\-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "itinerary.pdf";

  return base.endsWith(".pdf")
    ? base
    : `${base}.pdf`;
}

function pdfFile(
  formData: FormData,
  required: boolean,
) {
  const entry = formData.get("pdf_file");

  if (!(entry instanceof File) || entry.size === 0) {
    if (required) {
      redirect("/admin/itineraries?error=file-required");
    }
    return null;
  }

  const looksLikePdf =
    entry.type === "application/pdf" ||
    entry.name.toLowerCase().endsWith(".pdf");

  if (!looksLikePdf) {
    redirect("/admin/itineraries?error=file-type");
  }

  if (entry.size > MAX_PDF_BYTES) {
    redirect("/admin/itineraries?error=file-size");
  }

  return entry;
}

async function requireAdmin() {
  const context = await requireStaff();

  if (context.profile.role !== "admin") {
    redirect("/admin/itineraries?error=admin-only");
  }

  return context;
}

async function uploadPdf(file: File) {
  const db = createServiceSupabaseClient();

  const path = `${new Date().getUTCFullYear()}/${randomUUID()}-${safeFileName(
    file.name,
  )}`;

  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await db.storage
    .from(BUCKET)
    .upload(path, bytes, {
      contentType: "application/pdf",
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error(
      "[admin itineraries] PDF upload failed",
      error.message,
    );
    redirect("/admin/itineraries?error=upload");
  }

  const {
    data: { publicUrl },
  } = db.storage.from(BUCKET).getPublicUrl(path);

  return {
    path,
    publicUrl,
  };
}

export async function createItinerary(
  formData: FormData,
) {
  await requireAdmin();

  const title = value(formData, "title", 160);
  const region = value(formData, "region", 120);
  const duration = value(formData, "duration", 80);
  const sortOrder = integer(formData, "sort_order");
  const file = pdfFile(formData, true)!;

  if (!title || !region || !duration) {
    redirect("/admin/itineraries?error=invalid");
  }

  const uploaded = await uploadPdf(file);
  const db = createServiceSupabaseClient();

  const { error } = await db
    .from("itineraries")
    .insert({
      title,
      region: region || null,
      duration: duration || null,
      pdf_url: uploaded.publicUrl,
      storage_path: uploaded.path,
      sort_order: sortOrder,
      is_active: true,
    });

  if (error) {
    await db.storage
      .from(BUCKET)
      .remove([uploaded.path])
      .catch(() => undefined);

    console.error(
      "[admin itineraries] create failed",
      error.code,
      error.message,
    );

    redirect("/admin/itineraries?error=save");
  }

  revalidatePath("/admin/itineraries");
  revalidatePath("/thank-you");

  redirect("/admin/itineraries?saved=created");
}

export async function updateItinerary(
  formData: FormData,
) {
  await requireAdmin();

  const id = value(formData, "id", 64);
  const title = value(formData, "title", 160);
  const region = value(formData, "region", 120);
  const duration = value(formData, "duration", 80);
  const sortOrder = integer(formData, "sort_order");
  const isActive =
    formData.get("is_active") === "on";
  const replacement = pdfFile(formData, false);

  if (!id || !title || !region || !duration) {
    redirect("/admin/itineraries?error=invalid");
  }

  const db = createServiceSupabaseClient();

  const { data: existing, error: existingError } =
    await db
      .from("itineraries")
      .select("id,pdf_url,storage_path")
      .eq("id", id)
      .maybeSingle();

  if (existingError || !existing) {
    redirect("/admin/itineraries?error=missing");
  }

  let nextPdfUrl = existing.pdf_url as string;
  let nextStoragePath =
    (existing.storage_path as string | null) ?? null;
  let uploadedNewPath: string | null = null;

  if (replacement) {
    const uploaded = await uploadPdf(replacement);
    nextPdfUrl = uploaded.publicUrl;
    nextStoragePath = uploaded.path;
    uploadedNewPath = uploaded.path;
  }

  const { error } = await db
    .from("itineraries")
    .update({
      title,
      region: region || null,
      duration: duration || null,
      pdf_url: nextPdfUrl,
      storage_path: nextStoragePath,
      sort_order: sortOrder,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) {
    if (uploadedNewPath) {
      await db.storage
        .from(BUCKET)
        .remove([uploadedNewPath])
        .catch(() => undefined);
    }

    console.error(
      "[admin itineraries] update failed",
      error.code,
      error.message,
    );

    redirect("/admin/itineraries?error=save");
  }

  if (
    replacement &&
    existing.storage_path &&
    existing.storage_path !== nextStoragePath
  ) {
    await db.storage
      .from(BUCKET)
      .remove([existing.storage_path as string])
      .catch(() => undefined);
  }

  revalidatePath("/admin/itineraries");
  revalidatePath("/thank-you");

  redirect("/admin/itineraries?saved=updated");
}

export async function deleteItinerary(
  formData: FormData,
) {
  await requireAdmin();

  const id = value(formData, "id", 64);

  if (!id) {
    redirect("/admin/itineraries?error=invalid");
  }

  const db = createServiceSupabaseClient();

  const { data: existing } = await db
    .from("itineraries")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await db
    .from("itineraries")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(
      "[admin itineraries] delete failed",
      error.code,
      error.message,
    );

    redirect("/admin/itineraries?error=delete");
  }

  if (existing?.storage_path) {
    await db.storage
      .from(BUCKET)
      .remove([existing.storage_path])
      .catch(() => undefined);
  }

  revalidatePath("/admin/itineraries");
  revalidatePath("/thank-you");

  redirect("/admin/itineraries?saved=deleted");
}
