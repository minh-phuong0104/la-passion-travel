import Link from "next/link";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { DeleteLeadButton } from "@/components/admin/DeleteLeadButton";
import {
  dateTime,
  listOrDash,
  phoneNumber,
  textOrDash,
  titleCase,
} from "@/components/admin/lead-display";
import {
  PARTNER_SOURCES,
  sourceDisplay,
} from "@/lib/admin/partner-sources";
import { requireStaff } from "@/lib/auth/require-staff";

export const dynamic = "force-dynamic";

type SearchParams = Record<
  string,
  string | string[] | undefined
>;

type LeadSummary = {
  id: string;
  full_name: string;
  phone: string;
  country_code: string;
  email: string | null;
  destinations: unknown;
  duration: string | null;
  budget: string | null;
  traffic_type: string;
  traffic_channel: string;
  first_touch_source: string | null;
  first_touch_content: string | null;
  last_touch_source: string | null;
  last_touch_content: string | null;
  status: string;
  created_at: string;
};

const statuses = [
  "all",
  "new",
  "contacted",
  "qualified",
  "won",
  "lost",
] as const;

const platforms = [
  "all",
  "instagram",
  "facebook",
] as const;

const pageSize = 25;

function hasTrackedPartner(
  source: string | null | undefined,
  content: string | null | undefined,
) {
  const normalizedSource = String(source ?? "")
    .trim()
    .toLowerCase();
  const normalizedContent = String(content ?? "")
    .trim()
    .toLowerCase();

  const isPartnerPlatform =
    normalizedSource === "instagram" ||
    normalizedSource === "ig" ||
    normalizedSource === "facebook" ||
    normalizedSource === "fb";

  return (
    isPartnerPlatform &&
    PARTNER_SOURCES.some(
      (item) => item.key === normalizedContent,
    )
  );
}

function first(
  value:
    | string
    | string[]
    | undefined,
): string {
  return Array.isArray(value)
    ? value[0] || ""
    : value || "";
}

function statusClass(status: string) {
  switch (status) {
    case "won":
      return "border-[#00c58a]/35 bg-[#00c58a]/10 text-[#00c58a]";
    case "qualified":
      return "border-[#f0bd1a]/35 bg-[#f0bd1a]/10 text-[#f0bd1a]";
    case "lost":
      return "border-red-400/30 bg-red-500/10 text-red-300";
    case "contacted":
      return "border-sky-400/30 bg-sky-400/10 text-sky-300";
    default:
      return "border-white/10 bg-white/[0.05] text-white/70";
  }
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { supabase, profile } =
    await requireStaff();

  const params =
    await searchParams;

  const statusInput =
    first(params.status).toLowerCase();
  const platformInput =
    first(params.platform).toLowerCase();
  const partnerInput =
    first(params.partner).toLowerCase();

  const status =
    statuses.find(
      (item) =>
        item === statusInput,
    ) ?? "all";

  const platform =
    platforms.find(
      (item) =>
        item === platformInput,
    ) ?? "all";

  const partner =
    PARTNER_SOURCES.find(
      (item) =>
        item.key === partnerInput,
    )?.key ?? "all";

  const q = first(params.q)
    .trim()
    .slice(0, 80);

  const search = q
    .replace(
      /[^\p{L}\p{N}\s@.+_-]/gu,
      "",
    )
    .trim();

  const requestedPage =
    Number(first(params.page));

  const page =
    Number.isSafeInteger(
      requestedPage,
    ) && requestedPage > 0
      ? Math.min(
          requestedPage,
          10000,
        )
      : 1;

  function href(changes: {
    status?: string;
    platform?: string;
    partner?: string;
    q?: string;
    page?: number;
  }) {
    const next = {
      status:
        changes.status ?? status,
      platform:
        changes.platform ??
        platform,
      partner:
        changes.partner ?? partner,
      q: changes.q ?? q,
      page: changes.page ?? 1,
    };

    const query =
      new URLSearchParams();

    if (next.status !== "all") {
      query.set(
        "status",
        next.status,
      );
    }

    if (next.platform !== "all") {
      query.set(
        "platform",
        next.platform,
      );
    }

    if (next.partner !== "all") {
      query.set(
        "partner",
        next.partner,
      );
    }

    if (next.q) {
      query.set("q", next.q);
    }

    if (next.page > 1) {
      query.set(
        "page",
        String(next.page),
      );
    }

    const encoded =
      query.toString();

    return `/admin/leads${
      encoded
        ? `?${encoded}`
        : ""
    }`;
  }

  let query = supabase
    .from("leads")
    .select(
      "id,full_name,phone,country_code,email,destinations,duration,budget,traffic_type,traffic_channel,first_touch_source,first_touch_content,last_touch_source,last_touch_content,status,created_at",
      { count: "exact" },
    );

  if (status !== "all") {
    query = query.eq(
      "status",
      status,
    );
  }

  if (platform === "instagram") {
    query = query.or(
      "first_touch_source.in.(instagram,ig),last_touch_source.in.(instagram,ig)",
    );
  }

  if (platform === "facebook") {
    query = query.or(
      "first_touch_source.in.(facebook,fb),last_touch_source.in.(facebook,fb)",
    );
  }

  if (partner !== "all") {
    query = query.or(
      `first_touch_content.eq.${partner},last_touch_content.eq.${partner}`,
    );
  }

  if (search) {
    query = query.or(
      `full_name.ilike.*${search}*,phone.ilike.*${search}*,email.ilike.*${search}*`,
    );
  }

  const {
    data,
    error,
    count,
  } = await query
    .order("created_at", {
      ascending: false,
    })
    .range(
      (page - 1) * pageSize,
      page * pageSize - 1,
    );

  const leads =
    (data ??
      []) as LeadSummary[];

  const total = count ?? 0;

  const pageCount =
    Math.ceil(
      total / pageSize,
    );

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#1d1b18]">
      <AdminHeader
        name={
          profile.full_name ||
          profile.email
        }
        role={profile.role}
      />

      <main className="px-4 py-6 sm:px-6 lg:ml-[260px] lg:px-8 lg:py-8 xl:px-10">
        <div className="mx-auto max-w-[1500px]">
          <section className="rounded-[22px] bg-[#1d1b18] px-6 py-7 text-white shadow-[0_16px_36px_rgba(0,0,0,0.12)] sm:px-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#00c58a]">
                  Customer database
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                    Sales Leads
                  </h1>
                  <span className="rounded-full border border-[#00c58a]/35 bg-[#00c58a]/10 px-3 py-1 text-xs font-bold text-[#00c58a]">
                    {total} leads
                  </span>
                </div>
                <p className="mt-2 text-sm text-white/50">
                  Filter by Instagram /
                  Facebook and the exact
                  partner account that sent
                  the customer.
                </p>
              </div>

              <Link
                href="/admin"
                className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-white/80 transition hover:bg-white/[0.06]"
              >
                ← Dashboard
              </Link>
            </div>
          </section>

          {first(params.deleted) === "1" && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-800">
              Lead deleted successfully.
            </div>
          )}

          {first(params.error) && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-800">
              {first(params.error) === "admin-only"
                ? "Only admins can delete leads."
                : "The lead could not be deleted. Please try again."}
            </div>
          )}

          <section className="mt-6 rounded-[22px] bg-[#1d1b18] p-5 text-white shadow-[0_12px_28px_rgba(0,0,0,0.10)] sm:p-6">
            <form
              method="get"
              action="/admin/leads"
              className="grid gap-3 lg:grid-cols-[minmax(250px,1.15fr)_minmax(160px,.55fr)_minmax(190px,.7fr)_minmax(160px,.55fr)_auto]"
            >
              <label>
                <FilterLabel>
                  Search
                </FilterLabel>
                <input
                  name="q"
                  type="search"
                  defaultValue={q}
                  maxLength={80}
                  placeholder="Name, phone, or email..."
                  className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#00c58a]/60"
                />
              </label>

              <label>
                <FilterLabel>
                  Platform
                </FilterLabel>
                <select
                  name="platform"
                  defaultValue={platform}
                  className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-[#00c58a]/60"
                >
                  <option value="all">
                    All platforms
                  </option>
                  <option value="instagram">
                    Instagram
                  </option>
                  <option value="facebook">
                    Facebook
                  </option>
                </select>
              </label>

              <label>
                <FilterLabel>
                  Partner account
                </FilterLabel>
                <select
                  name="partner"
                  defaultValue={partner}
                  className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-[#00c58a]/60"
                >
                  <option value="all">
                    All accounts
                  </option>
                  {PARTNER_SOURCES.map(
                    (item) => (
                      <option
                        key={item.key}
                        value={item.key}
                      >
                        {item.label}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label>
                <FilterLabel>
                  Status
                </FilterLabel>
                <select
                  name="status"
                  defaultValue={status}
                  className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-[#00c58a]/60"
                >
                  {statuses.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {titleCase(
                          item,
                        )}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="rounded-xl bg-[#00c58a] px-5 py-3 text-sm font-bold text-[#10231d] transition hover:bg-[#19d99d]"
                >
                  Apply
                </button>

                {(q ||
                  status !== "all" ||
                  platform !== "all" ||
                  partner !== "all") && (
                  <Link
                    href="/admin/leads"
                    className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white/55 hover:bg-white/[0.06]"
                  >
                    Clear
                  </Link>
                )}
              </div>
            </form>

            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
                Partner shortcuts
              </p>

              <div className="flex flex-wrap gap-2">
                {PARTNER_SOURCES.map(
                  (item) => (
                    <Link
                      key={item.key}
                      href={href({
                        partner:
                          item.key,
                      })}
                      className={[
                        "rounded-full border px-3.5 py-2 text-xs font-bold transition",
                        partner === item.key
                          ? "border-[#00c58a]/40 bg-[#00c58a] text-[#10231d]"
                          : "border-white/10 bg-white/[0.04] text-white/55 hover:bg-white/[0.08]",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  ),
                )}
              </div>
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-[22px] bg-[#1d1b18] text-white shadow-[0_12px_28px_rgba(0,0,0,0.11)]">
            {error ? (
              <div className="px-6 py-16 text-center">
                <h2 className="text-2xl font-bold">
                  Leads could not be
                  loaded
                </h2>
                <p className="mt-2 text-sm text-white/45">
                  Refresh the page or try
                  again shortly.
                </p>
              </div>
            ) : leads.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <h2 className="text-2xl font-bold">
                  No leads found
                </h2>
                <p className="mt-2 text-sm text-white/45">
                  Try another source,
                  partner account or
                  status.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] border-collapse text-left">
                  <thead className="bg-black/30 text-[10px] font-bold uppercase tracking-[0.1em] text-white/45">
                    <tr>
                      <th className="px-6 py-4">
                        Lead
                      </th>
                      <th className="px-4 py-4">
                        Duration
                      </th>
                      <th className="px-4 py-4">
                        Journey
                      </th>
                      <th className="px-4 py-4">
                        Budget
                      </th>
                      <th className="px-4 py-4 text-center">
                        Source
                      </th>
                      <th className="px-4 py-4 text-center">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {leads.map(
                      (lead) => {
                        const phone =
                          phoneNumber(
                            lead.phone,
                            lead.country_code,
                          );

                        const preferLastTouch =
                          hasTrackedPartner(
                            lead.last_touch_source,
                            lead.last_touch_content,
                          );

                        const source =
                          sourceDisplay({
                            source:
                              preferLastTouch
                                ? lead.last_touch_source
                                : lead.first_touch_source,
                            content:
                              preferLastTouch
                                ? lead.last_touch_content
                                : lead.first_touch_content,
                            trafficChannel:
                              lead.traffic_channel,
                          });

                        return (
                          <tr
                            key={lead.id}
                            className="border-t border-white/[0.07] transition hover:bg-white/[0.035]"
                          >
                            <td className="px-6 py-4 align-middle">
                              <Link
                                href={`/admin/leads/${lead.id}`}
                                className="font-bold text-[#00c58a] hover:text-[#38e5ad]"
                              >
                                {
                                  lead.full_name
                                }
                              </Link>
                              <p className="mt-1 font-mono text-xs text-white/45">
                                {phone}
                              </p>
                              <p className="mt-1 text-[11px] text-white/30">
                                {dateTime(
                                  lead.created_at,
                                )}
                              </p>
                            </td>

                            <td className="px-4 py-4 align-middle text-sm text-white/70">
                              {textOrDash(
                                lead.duration,
                              )}
                            </td>

                            <td className="max-w-64 px-4 py-4 align-middle text-sm text-white/70">
                              <span className="line-clamp-2">
                                {listOrDash(
                                  lead.destinations,
                                )}
                              </span>
                            </td>

                            <td className="px-4 py-4 align-middle text-sm text-white/70">
                              {textOrDash(
                                lead.budget,
                              )}
                            </td>

                            <td className="px-4 py-4 text-center align-middle">
                              <span className="block text-xs font-bold text-white/75">
                                {
                                  source.platform
                                }
                              </span>
                              {source.partner ? (
                                <span className="mt-1 block text-xs font-bold text-[#00c58a]">
                                  {
                                    source.partner
                                  }
                                </span>
                              ) : (
                                <span className="mt-1 block text-[11px] text-white/30">
                                  No partner tag
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-4 text-center align-middle">
                              <span
                                className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold ${statusClass(
                                  lead.status,
                                )}`}
                              >
                                {titleCase(
                                  lead.status,
                                )}
                              </span>
                            </td>

                            <td className="px-6 py-4 align-middle">
                              <div className="mx-auto flex w-[92px] flex-col gap-2">
                                <Link
                                  href={`/admin/leads/${lead.id}`}
                                  className="inline-flex min-h-9 w-full items-center justify-center rounded-lg bg-[#00c58a] px-3.5 py-2 text-xs font-bold text-[#10231d] transition hover:bg-[#19d99d]"
                                >
                                  Open
                                </Link>

                                {profile.role === "admin" && (
                                  <DeleteLeadButton id={lead.id} />
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {!error &&
            pageCount > 1 && (
              <nav className="mt-5 flex items-center justify-between gap-3 text-sm text-[#716d63]">
                <span>
                  Page {page} of{" "}
                  {pageCount}
                </span>

                <div className="flex gap-2">
                  {page > 1 && (
                    <Link
                      href={href({
                        page:
                          page - 1,
                      })}
                      className="rounded-full border border-black/10 bg-white px-4 py-2 font-bold text-[#1d1b18] hover:bg-[#eeeae1]"
                    >
                      Previous
                    </Link>
                  )}

                  {page <
                    pageCount && (
                    <Link
                      href={href({
                        page:
                          page + 1,
                      })}
                      className="rounded-full bg-[#1d1b18] px-4 py-2 font-bold text-white hover:bg-black"
                    >
                      Next
                    </Link>
                  )}
                </div>
              </nav>
            )}
        </div>
      </main>
    </div>
  );
}

function FilterLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">
      {children}
    </span>
  );
}
