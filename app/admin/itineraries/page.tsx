import {
  createItinerary,
  deleteItinerary,
  updateItinerary,
} from "@/app/admin/itineraries/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { requireStaff } from "@/lib/auth/require-staff";

export const dynamic = "force-dynamic";

type Itinerary = {
  id: string;
  title: string;
  region: string | null;
  duration: string | null;
  pdf_url: string;
  storage_path: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

type SearchParams = Promise<{
  error?: string;
  saved?: string;
}>;

function errorMessage(code?: string) {
  switch (code) {
    case "admin-only":
      return "Only admins can change itineraries.";
    case "file-required":
      return "Please choose a PDF file.";
    case "file-type":
      return "Only PDF files can be uploaded.";
    case "file-size":
      return "The PDF is too large. Maximum size is 25 MB.";
    case "upload":
      return "The PDF upload failed. Please try again.";
    case "invalid":
      return "Please enter a title, region, duration, and PDF file.";
    case "missing":
      return "This itinerary no longer exists.";
    case "delete":
      return "The itinerary could not be deleted.";
    case "save":
      return "The itinerary could not be saved.";
    default:
      return null;
  }
}

export default async function ItinerariesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { supabase, profile } = await requireStaff();
  const params = await searchParams;

  const [itineraryResult, downloadResult] = await Promise.all([
    supabase
      .from("itineraries")
      .select(
        "id,title,region,duration,pdf_url,storage_path,is_active,sort_order,created_at",
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),

    supabase.from("itinerary_downloads").select("itinerary_id"),
  ]);

  const itineraries = (itineraryResult.data ?? []) as Itinerary[];

  const counts = new Map<string, number>();

  for (const row of downloadResult.data ?? []) {
    const id = String(row.itinerary_id ?? "");
    if (!id) continue;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  const canManage = profile.role === "admin";
  const error = errorMessage(params.error);

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#1d1b18]">
      <AdminHeader name={profile.full_name || profile.email} role={profile.role} />

      <main className="px-4 py-6 sm:px-6 lg:ml-[260px] lg:px-8 lg:py-8 xl:px-10">
        <div className="mx-auto max-w-[1500px]">
          <section className="rounded-[22px] bg-[#1d1b18] px-6 py-7 text-white shadow-[0_16px_36px_rgba(0,0,0,0.12)] sm:px-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#00c58a]">
                  Content library
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                    Itineraries
                  </h1>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-bold text-white/65">
                    {itineraries.length} PDFs
                  </span>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                  Add every tour here. Region and duration are used automatically to match each
                  customer with the most relevant PDF after they submit the journey form.
                </p>
              </div>

              <div className="rounded-2xl border border-[#00c58a]/25 bg-[#00c58a]/10 px-4 py-3 text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#00c58a]">
                  Total downloads
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {[...counts.values()].reduce((sum, value) => sum + value, 0)}
                </p>
              </div>
            </div>
          </section>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {params.saved && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-800">
              {params.saved === "created"
                ? "Itinerary uploaded successfully."
                : params.saved === "updated"
                  ? "Itinerary updated successfully."
                  : "Itinerary deleted successfully."}
            </div>
          )}

          {canManage && (
            <section className="mt-6 rounded-[22px] bg-[#1d1b18] p-6 text-white shadow-[0_12px_28px_rgba(0,0,0,0.10)] sm:p-7">
              <div className="border-b border-white/10 pb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#00c58a]">
                  Add itinerary
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-[-0.025em]">Upload a new PDF</h2>
              </div>

              <form action={createItinerary} className="mt-6 grid gap-4 lg:grid-cols-12">
                <label className="text-sm font-bold text-white/70 lg:col-span-4">
                  Title
                  <input
                    required
                    name="title"
                    placeholder="5-Day Phu Quoc Tour"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-normal text-white outline-none placeholder:text-white/25 focus:border-[#00c58a]/60"
                  />
                </label>

                <label className="text-sm font-bold text-white/70 lg:col-span-2">
                  Region
                  <input
                    required
                    name="region"
                    placeholder="Southern Vietnam"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-normal text-white outline-none placeholder:text-white/25 focus:border-[#00c58a]/60"
                  />
                </label>

                <label className="text-sm font-bold text-white/70 lg:col-span-2">
                  Duration
                  <input
                    required
                    name="duration"
                    placeholder="5D4N"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-normal text-white outline-none placeholder:text-white/25 focus:border-[#00c58a]/60"
                  />
                </label>

                <label className="text-sm font-bold text-white/70 lg:col-span-1">
                  Order
                  <input
                    name="sort_order"
                    type="number"
                    defaultValue={0}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-normal text-white outline-none focus:border-[#00c58a]/60"
                  />
                </label>

                <label className="text-sm font-bold text-white/70 lg:col-span-9">
                  PDF file
                  <input
                    required
                    name="pdf_file"
                    type="file"
                    accept=".pdf,application/pdf"
                    className="mt-2 block w-full rounded-xl border border-dashed border-white/15 bg-black/20 px-4 py-3 text-sm font-normal text-white/50 file:mr-4 file:rounded-lg file:border-0 file:bg-[#00c58a] file:px-4 file:py-2 file:font-bold file:text-[#10231d]"
                  />
                  <span className="mt-1.5 block text-xs font-normal text-white/35">
                    PDF only · maximum 25 MB
                  </span>
                </label>

                <div className="flex items-end lg:col-span-3">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#00c58a] px-5 py-3 font-bold text-[#10231d] transition hover:bg-[#19d99d]"
                  >
                    Upload itinerary
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="mt-6 space-y-4">
            {itineraryResult.error ? (
              <div className="rounded-[22px] bg-[#1d1b18] p-8 text-center text-white">
                <h2 className="text-2xl font-bold">Unable to load itineraries</h2>
                <p className="mt-2 text-sm text-white/45">Refresh the page and try again.</p>
              </div>
            ) : itineraries.length === 0 ? (
              <div className="rounded-[22px] bg-[#1d1b18] px-6 py-14 text-center text-white">
                <h2 className="text-2xl font-bold">No itineraries yet</h2>
                <p className="mt-2 text-sm text-white/45">Upload the first PDF above.</p>
              </div>
            ) : (
              itineraries.map((itinerary) => (
                <article
                  key={itinerary.id}
                  className="rounded-[22px] bg-[#1d1b18] p-5 text-white shadow-[0_10px_24px_rgba(0,0,0,0.10)] sm:p-6"
                >
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold">{itinerary.title}</h2>

                        <span
                          className={[
                            "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em]",
                            itinerary.is_active
                              ? "border-[#00c58a]/30 bg-[#00c58a]/10 text-[#00c58a]"
                              : "border-white/10 bg-white/[0.04] text-white/45",
                          ].join(" ")}
                        >
                          {itinerary.is_active ? "Active" : "Hidden"}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-white/40">
                        {counts.get(itinerary.id) ?? 0} tracked downloads
                        {itinerary.region ? ` · ${itinerary.region}` : ""}
                        {itinerary.duration ? ` · ${itinerary.duration}` : ""}
                      </p>
                    </div>

                    <a
                      href={itinerary.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-white/10 px-4 py-2 text-xs font-bold text-[#00c58a] transition hover:bg-white/[0.05]"
                    >
                      Open PDF ↗
                    </a>
                  </div>

                  {canManage ? (
                    <>
                      <form action={updateItinerary} className="grid gap-3 lg:grid-cols-12">
                        <input type="hidden" name="id" value={itinerary.id} />

                        <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/40 lg:col-span-4">
                          Title
                          <input
                            required
                            name="title"
                            defaultValue={itinerary.title}
                            className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-white outline-none focus:border-[#00c58a]/60"
                          />
                        </label>

                        <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/40 lg:col-span-2">
                          Region
                          <input
                            required
                            name="region"
                            defaultValue={itinerary.region ?? ""}
                            className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-white outline-none focus:border-[#00c58a]/60"
                          />
                        </label>

                        <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/40 lg:col-span-2">
                          Duration
                          <input
                            required
                            name="duration"
                            defaultValue={itinerary.duration ?? ""}
                            className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-white outline-none focus:border-[#00c58a]/60"
                          />
                        </label>

                        <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/40 lg:col-span-1">
                          Order
                          <input
                            name="sort_order"
                            type="number"
                            defaultValue={itinerary.sort_order}
                            className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-white outline-none focus:border-[#00c58a]/60"
                          />
                        </label>

                        <label className="flex items-end pb-2 lg:col-span-3">
                          <span className="flex items-center gap-2 text-sm font-bold text-white/65">
                            <input
                              name="is_active"
                              type="checkbox"
                              defaultChecked={itinerary.is_active}
                              className="h-4 w-4 accent-[#00c58a]"
                            />
                            Visible to customers
                          </span>
                        </label>

                        <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/40 lg:col-span-9">
                          Replace PDF (optional)
                          <input
                            name="pdf_file"
                            type="file"
                            accept=".pdf,application/pdf"
                            className="mt-1.5 block w-full rounded-xl border border-dashed border-white/10 bg-black/20 px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-white/45 file:mr-3 file:rounded-lg file:border-0 file:bg-white/[0.08] file:px-3 file:py-2 file:font-bold file:text-white/70"
                          />
                        </label>

                        <div className="flex items-end lg:col-span-3">
                          <button
                            type="submit"
                            className="w-full rounded-xl bg-[#00c58a] px-4 py-2.5 text-sm font-bold text-[#10231d] transition hover:bg-[#19d99d]"
                          >
                            Save changes
                          </button>
                        </div>
                      </form>

                      <form action={deleteItinerary} className="mt-3 flex justify-end">
                        <input type="hidden" name="id" value={itinerary.id} />
                        <button
                          type="submit"
                          className="text-xs font-bold text-red-300 underline-offset-4 hover:underline"
                        >
                          Delete itinerary
                        </button>
                      </form>
                    </>
                  ) : (
                    <p className="text-sm text-white/45">
                      Read-only access. Ask an admin to change this itinerary.
                    </p>
                  )}
                </article>
              ))
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
