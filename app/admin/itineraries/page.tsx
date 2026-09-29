import Link from "next/link";

import {
  createItinerary,
  deleteItinerary,
  updateItinerary,
} from "@/app/admin/itineraries/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { requireStaff } from "@/lib/auth/require-staff";

export const dynamic =
  "force-dynamic";

type Itinerary = {
  id: string;
  title: string;
  region: string | null;
  duration: string | null;
  pdf_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

type SearchParams = Promise<{
  error?: string;
}>;

export default async function ItinerariesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { supabase, profile } =
    await requireStaff();

  const params =
    await searchParams;

  const [
    itineraryResult,
    downloadResult,
  ] = await Promise.all([
    supabase
      .from("itineraries")
      .select(
        "id,title,region,duration,pdf_url,is_active,sort_order,created_at",
      )
      .order("sort_order", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      }),

    supabase
      .from("itinerary_downloads")
      .select("itinerary_id"),
  ]);

  const itineraries =
    (itineraryResult.data ??
      []) as Itinerary[];

  const counts = new Map<
    string,
    number
  >();

  for (const row of
    downloadResult.data ?? []) {
    const id =
      String(
        row.itinerary_id ?? "",
      );

    if (!id) continue;

    counts.set(
      id,
      (counts.get(id) ?? 0) +
        1,
    );
  }

  const canManage =
    profile.role === "admin";

  return (
    <div className="min-h-screen bg-cream">
      <AdminHeader
        name={
          profile.full_name ||
          profile.email
        }
        role={profile.role}
      />

      <main className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-olive">
              Content library
            </p>

            <h1 className="font-serif text-5xl font-semibold leading-none text-forest sm:text-6xl">
              Itineraries
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-olive">
              Manage the PDFs customers
              can download after
              submitting the journey
              form.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-full border border-forest/20 px-5 py-2.5 text-sm font-semibold text-forest transition hover:bg-white"
          >
            ← Dashboard
          </Link>
        </div>

        {params.error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
            {params.error ===
            "admin-only"
              ? "Only admins can change itineraries."
              : params.error ===
                  "invalid"
                ? "Please enter a title and a valid PDF URL."
                : "The itinerary could not be saved. Please try again."}
          </div>
        )}

        {canManage && (
          <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-forest/10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-olive">
              Add itinerary
            </p>

            <h2 className="mt-1 font-serif text-3xl text-forest">
              New downloadable PDF
            </h2>

            <form
              action={
                createItinerary
              }
              className="mt-5 grid gap-4 lg:grid-cols-12"
            >
              <label className="text-sm font-medium text-ink lg:col-span-4">
                Title
                <input
                  required
                  name="title"
                  placeholder="Northern Vietnam Highlights"
                  className="mt-2 w-full rounded-xl border border-forest/15 bg-cream/40 px-4 py-3 outline-none focus:border-gold"
                />
              </label>

              <label className="text-sm font-medium text-ink lg:col-span-2">
                Region
                <input
                  name="region"
                  placeholder="North"
                  className="mt-2 w-full rounded-xl border border-forest/15 bg-cream/40 px-4 py-3 outline-none focus:border-gold"
                />
              </label>

              <label className="text-sm font-medium text-ink lg:col-span-2">
                Duration
                <input
                  name="duration"
                  placeholder="7D6N"
                  className="mt-2 w-full rounded-xl border border-forest/15 bg-cream/40 px-4 py-3 outline-none focus:border-gold"
                />
              </label>

              <label className="text-sm font-medium text-ink lg:col-span-1">
                Order
                <input
                  name="sort_order"
                  type="number"
                  defaultValue={0}
                  className="mt-2 w-full rounded-xl border border-forest/15 bg-cream/40 px-4 py-3 outline-none focus:border-gold"
                />
              </label>

              <label className="text-sm font-medium text-ink lg:col-span-9">
                PDF / Google Drive URL
                <input
                  required
                  name="pdf_url"
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  className="mt-2 w-full rounded-xl border border-forest/15 bg-cream/40 px-4 py-3 outline-none focus:border-gold"
                />
              </label>

              <div className="flex items-end lg:col-span-3">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-forest px-5 py-3 font-semibold text-white transition hover:bg-teal"
                >
                  Add itinerary
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="space-y-4">
          {itineraryResult.error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
              Unable to load itineraries.
            </div>
          ) : itineraries.length ===
            0 ? (
            <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-forest/10">
              <h2 className="font-serif text-3xl text-forest">
                No itineraries yet
              </h2>

              <p className="mt-2 text-sm text-olive">
                Add the first PDF above.
              </p>
            </div>
          ) : (
            itineraries.map(
              (itinerary) => (
                <article
                  key={
                    itinerary.id
                  }
                  className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-forest/10"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-serif text-2xl text-forest">
                          {
                            itinerary.title
                          }
                        </h2>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            itinerary.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-black/5 text-olive"
                          }`}
                        >
                          {itinerary.is_active
                            ? "Active"
                            : "Hidden"}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-olive">
                        {
                          counts.get(
                            itinerary.id,
                          ) ?? 0
                        }{" "}
                        tracked downloads
                      </p>
                    </div>

                    <a
                      href={
                        itinerary.pdf_url
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-forest underline-offset-4 hover:underline"
                    >
                      Open PDF link ↗
                    </a>
                  </div>

                  {canManage ? (
                    <>
                      <form
                        action={
                          updateItinerary
                        }
                        className="grid gap-3 lg:grid-cols-12"
                      >
                        <input
                          type="hidden"
                          name="id"
                          value={
                            itinerary.id
                          }
                        />

                        <label className="text-xs font-semibold uppercase tracking-[0.1em] text-olive lg:col-span-4">
                          Title
                          <input
                            required
                            name="title"
                            defaultValue={
                              itinerary.title
                            }
                            className="mt-1.5 w-full rounded-xl border border-forest/15 px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-gold"
                          />
                        </label>

                        <label className="text-xs font-semibold uppercase tracking-[0.1em] text-olive lg:col-span-2">
                          Region
                          <input
                            name="region"
                            defaultValue={
                              itinerary.region ??
                              ""
                            }
                            className="mt-1.5 w-full rounded-xl border border-forest/15 px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-gold"
                          />
                        </label>

                        <label className="text-xs font-semibold uppercase tracking-[0.1em] text-olive lg:col-span-2">
                          Duration
                          <input
                            name="duration"
                            defaultValue={
                              itinerary.duration ??
                              ""
                            }
                            className="mt-1.5 w-full rounded-xl border border-forest/15 px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-gold"
                          />
                        </label>

                        <label className="text-xs font-semibold uppercase tracking-[0.1em] text-olive lg:col-span-1">
                          Order
                          <input
                            name="sort_order"
                            type="number"
                            defaultValue={
                              itinerary.sort_order
                            }
                            className="mt-1.5 w-full rounded-xl border border-forest/15 px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-gold"
                          />
                        </label>

                        <label className="flex items-end pb-2 lg:col-span-3">
                          <span className="flex items-center gap-2 text-sm font-medium text-ink">
                            <input
                              name="is_active"
                              type="checkbox"
                              defaultChecked={
                                itinerary.is_active
                              }
                              className="h-4 w-4 accent-[#183f39]"
                            />
                            Visible to customers
                          </span>
                        </label>

                        <label className="text-xs font-semibold uppercase tracking-[0.1em] text-olive lg:col-span-9">
                          PDF URL
                          <input
                            required
                            name="pdf_url"
                            type="url"
                            defaultValue={
                              itinerary.pdf_url
                            }
                            className="mt-1.5 w-full rounded-xl border border-forest/15 px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-gold"
                          />
                        </label>

                        <div className="flex items-end lg:col-span-3">
                          <button
                            type="submit"
                            className="w-full rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal"
                          >
                            Save changes
                          </button>
                        </div>
                      </form>

                      <form
                        action={
                          deleteItinerary
                        }
                        className="mt-3 flex justify-end"
                      >
                        <input
                          type="hidden"
                          name="id"
                          value={
                            itinerary.id
                          }
                        />

                        <button
                          type="submit"
                          className="text-xs font-semibold text-red-700 underline-offset-4 hover:underline"
                        >
                          Delete itinerary
                        </button>
                      </form>
                    </>
                  ) : (
                    <p className="text-sm text-olive">
                      Read-only access.
                      Ask an admin to
                      change this
                      itinerary.
                    </p>
                  )}
                </article>
              ),
            )
          )}
        </section>
      </main>
    </div>
  );
}
