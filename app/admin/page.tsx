import Link from "next/link";

import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  dateTime,
  listOrDash,
  phoneNumber,
  titleCase,
} from "@/components/admin/lead-display";
import {
  PARTNER_SOURCES,
  sourceDisplay,
} from "@/lib/admin/partner-sources";
import { requireStaff } from "@/lib/auth/require-staff";

export const dynamic = "force-dynamic";

type RecentLead = {
  id: string;
  full_name: string;
  phone: string;
  country_code: string;
  email: string | null;
  destinations: unknown;
  traffic_channel: string;
  first_touch_source: string | null;
  first_touch_content: string | null;
  status: string;
  created_at: string;
};

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.min(
    100,
    Math.round((value / total) * 100),
  );
}

export default async function AdminPage() {
  const { supabase, profile } =
    await requireStaff();

  const basicQueries = [
    supabase
      .from("leads")
      .select("id", {
        count: "exact",
        head: true,
      }),
    supabase
      .from("leads")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "new"),
    supabase
      .from("leads")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "contacted"),
    supabase
      .from("leads")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "qualified"),
    supabase
      .from("leads")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "won"),
    supabase
      .from("leads")
      .select(
        "id,full_name,phone,country_code,email,destinations,traffic_channel,first_touch_source,first_touch_content,status,created_at",
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(6),
  ] as const;

  const partnerQueries = [
    ...PARTNER_SOURCES.map((partner) =>
      supabase
        .from("leads")
        .select("id", {
          count: "exact",
          head: true,
        })
        .in("first_touch_source", [
          "instagram",
          "ig",
        ])
        .eq(
          "first_touch_content",
          partner.key,
        ),
    ),
    ...PARTNER_SOURCES.map((partner) =>
      supabase
        .from("leads")
        .select("id", {
          count: "exact",
          head: true,
        })
        .in("first_touch_source", [
          "facebook",
          "fb",
        ])
        .eq(
          "first_touch_content",
          partner.key,
        ),
    ),
  ];

  const [
    basicResults,
    partnerResults,
  ] = await Promise.all([
    Promise.all(basicQueries),
    Promise.all(partnerQueries),
  ]);

  const [
    totalResult,
    newResult,
    contactedResult,
    qualifiedResult,
    wonResult,
    recentResult,
  ] = basicResults;

  const total =
    totalResult.count ?? 0;
  const newCount =
    newResult.count ?? 0;
  const contactedCount =
    contactedResult.count ?? 0;
  const qualifiedCount =
    qualifiedResult.count ?? 0;
  const wonCount =
    wonResult.count ?? 0;

  const recentLeads =
    (recentResult.data ??
      []) as RecentLead[];

  const instagramPartnerCounts =
    PARTNER_SOURCES.map(
      (partner, index) => ({
        ...partner,
        value:
          partnerResults[index]
            ?.count ?? 0,
      }),
    );

  const facebookPartnerCounts =
    PARTNER_SOURCES.map(
      (partner, index) => ({
        ...partner,
        value:
          partnerResults[
            PARTNER_SOURCES.length +
              index
          ]?.count ?? 0,
      }),
    );

  const instagramCount =
    instagramPartnerCounts.reduce(
      (sum, row) =>
        sum + row.value,
      0,
    );

  const facebookCount =
    facebookPartnerCounts.reduce(
      (sum, row) =>
        sum + row.value,
      0,
    );

  const hasError = Boolean(
    basicResults.some(
      (result) => result.error,
    ) ||
      partnerResults.some(
        (result) => result.error,
      ),
  );

  const kpis = [
    {
      label: "Total leads",
      value: total,
      sub: "All captured enquiries",
      accent: "text-[#00c58a]",
      href: "/admin/leads",
    },
    {
      label: "New",
      value: newCount,
      sub: "Waiting for first contact",
      accent: "text-white",
      href: "/admin/leads?status=new",
    },
    {
      label: "Qualified",
      value: qualifiedCount,
      sub: "Sales-ready travellers",
      accent: "text-[#f0bd1a]",
      href: "/admin/leads?status=qualified",
    },
    {
      label: "Won",
      value: wonCount,
      sub: "Closed bookings",
      accent: "text-[#00c58a]",
      href: "/admin/leads?status=won",
    },
  ];

  const pipeline = [
    {
      label: "All leads",
      value: total,
      color: "bg-[#69645e]",
    },
    {
      label: "New",
      value: newCount,
      color: "bg-[#00a978]",
    },
    {
      label: "Contacted",
      value: contactedCount,
      color: "bg-[#00c58a]",
    },
    {
      label: "Qualified",
      value: qualifiedCount,
      color: "bg-[#f0bd1a]",
    },
    {
      label: "Won",
      value: wonCount,
      color: "bg-[#d7aa4b]",
    },
  ];

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
          <section className="rounded-[22px] border border-[#0f5a46] bg-[linear-gradient(100deg,#073f33_0%,#1d1b18_56%,#1d1b18_100%)] px-6 py-7 text-white shadow-[0_16px_36px_rgba(0,0,0,0.12)] sm:px-8 lg:flex lg:items-center lg:justify-between lg:gap-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#00c58a]">
                La Passion Travel
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                Sales Lead Performance
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                Live overview of enquiries,
                qualification and tracked
                Instagram / Facebook partner
                sources.
              </p>
            </div>

            <Link
              href="/admin/leads"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#00c58a] px-5 py-3 text-sm font-bold text-[#10231d] transition hover:bg-[#19d99d] lg:mt-0"
            >
              ☎ View all leads ({total})
            </Link>
          </section>

          {hasError && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
              Some dashboard data could not
              be loaded. Try refreshing the
              page.
            </div>
          )}

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((item) => (
              <Link
                href={item.href}
                key={item.label}
                className="rounded-[20px] bg-[#1d1b18] p-5 text-white shadow-[0_10px_24px_rgba(0,0,0,0.10)] ring-1 ring-white/5 transition hover:-translate-y-0.5"
              >
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-white/55">
                  {item.label}
                </p>
                <p
                  className={`mt-3 text-4xl font-bold tracking-[-0.04em] ${item.accent}`}
                >
                  {item.value}
                </p>
                <p className="mt-2 text-xs text-white/50">
                  {item.sub}
                </p>
              </Link>
            ))}
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
            <section className="rounded-[22px] bg-[#1d1b18] p-6 text-white shadow-[0_12px_28px_rgba(0,0,0,0.11)] sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
                <div>
                  <h2 className="text-2xl font-bold tracking-[-0.025em]">
                    Lead Pipeline
                  </h2>
                  <p className="mt-1 text-sm text-white/50">
                    Captured enquiry to
                    closed sale.
                  </p>
                </div>

                <span className="rounded-full border border-[#00c58a]/40 bg-[#00c58a]/10 px-3 py-1.5 text-xs font-bold text-[#00c58a]">
                  {percent(
                    wonCount,
                    total,
                  )}
                  % won
                </span>
              </div>

              <div className="mt-6 space-y-5">
                {pipeline.map(
                  (item) => {
                    const width =
                      item.label ===
                      "All leads"
                        ? 100
                        : percent(
                            item.value,
                            total,
                          );

                    return (
                      <div key={item.label}>
                        <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                          <span className="font-bold text-white/80">
                            {item.label}
                          </span>
                          <span className="font-bold text-white/75">
                            {item.value} (
                            {width}%)
                          </span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-white/[0.07]">
                          <div
                            className={`h-full rounded-full ${item.color}`}
                            style={{
                              width: `${width}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </section>

            <section className="rounded-[22px] bg-[#1d1b18] p-6 text-white shadow-[0_12px_28px_rgba(0,0,0,0.11)] sm:p-7">
              <div className="border-b border-white/10 pb-5">
                <h2 className="text-2xl font-bold tracking-[-0.025em]">
                  Partner Sources
                </h2>
                <p className="mt-1 text-sm text-white/50">
                  Exact IG / FB page that
                  generated each lead.
                </p>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <PartnerGroup
                  title="Instagram"
                  total={instagramCount}
                  rows={
                    instagramPartnerCounts
                  }
                  platform="instagram"
                />
                <PartnerGroup
                  title="Facebook"
                  total={facebookCount}
                  rows={
                    facebookPartnerCounts
                  }
                  platform="facebook"
                />
              </div>
            </section>
          </div>

          <section className="mt-6 overflow-hidden rounded-[22px] bg-[#1d1b18] text-white shadow-[0_12px_28px_rgba(0,0,0,0.11)]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5 sm:px-7">
              <div>
                <h2 className="text-2xl font-bold tracking-[-0.025em]">
                  Recent Sales Leads
                </h2>
                <p className="mt-1 text-sm text-white/45">
                  Latest customer enquiries
                  with exact partner
                  attribution when available.
                </p>
              </div>

              <Link
                href="/admin/leads"
                className="text-sm font-bold text-[#00c58a] hover:text-[#38e5ad]"
              >
                View database →
              </Link>
            </div>

            {recentLeads.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <p className="text-xl font-bold">
                  No leads yet
                </p>
                <p className="mt-2 text-sm text-white/45">
                  New customer enquiries will
                  appear here automatically.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left">
                  <thead className="bg-black/25 text-[11px] font-bold uppercase tracking-[0.08em] text-white/50">
                    <tr>
                      <th className="px-6 py-4">
                        Lead
                      </th>
                      <th className="px-4 py-4">
                        Journey
                      </th>
                      <th className="px-4 py-4">
                        Source
                      </th>
                      <th className="px-4 py-4">
                        Status
                      </th>
                      <th className="px-6 py-4">
                        Received
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentLeads.map(
                      (lead) => {
                        const source =
                          sourceDisplay({
                            source:
                              lead.first_touch_source,
                            content:
                              lead.first_touch_content,
                            trafficChannel:
                              lead.traffic_channel,
                          });

                        return (
                          <tr
                            key={lead.id}
                            className="border-t border-white/[0.07] transition hover:bg-white/[0.035]"
                          >
                            <td className="px-6 py-4">
                              <Link
                                href={`/admin/leads/${lead.id}`}
                                className="font-bold text-[#00c58a] hover:text-[#38e5ad]"
                              >
                                {
                                  lead.full_name
                                }
                              </Link>
                              <p className="mt-1 text-xs text-white/45">
                                {phoneNumber(
                                  lead.phone,
                                  lead.country_code,
                                )}
                              </p>
                            </td>

                            <td className="max-w-64 px-4 py-4 text-sm text-white/70">
                              <span className="line-clamp-2">
                                {listOrDash(
                                  lead.destinations,
                                )}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <span className="block text-xs font-bold text-white/75">
                                {
                                  source.platform
                                }
                              </span>
                              {source.partner && (
                                <span className="mt-1 block text-xs font-bold text-[#00c58a]">
                                  {
                                    source.partner
                                  }
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={[
                                  "inline-flex rounded-md px-2.5 py-1 text-xs font-bold",
                                  lead.status ===
                                  "won"
                                    ? "bg-[#00c58a]/15 text-[#00c58a]"
                                    : lead.status ===
                                        "qualified"
                                      ? "bg-[#f0bd1a]/15 text-[#f0bd1a]"
                                      : "bg-white/[0.06] text-white/70",
                                ].join(" ")}
                              >
                                {titleCase(
                                  lead.status,
                                )}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-6 py-4 text-xs text-white/45">
                              {dateTime(
                                lead.created_at,
                              )}
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
        </div>
      </main>
    </div>
  );
}

function PartnerGroup({
  title,
  total,
  rows,
  platform,
}: {
  title: string;
  total: number;
  rows: readonly {
    key: string;
    label: string;
    value: number;
  }[];
  platform: "instagram" | "facebook";
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-bold text-white/85">
          {title}
        </p>
        <Link
          href={`/admin/leads?platform=${platform}`}
          className="text-xs font-bold text-[#00c58a]"
        >
          {total} leads →
        </Link>
      </div>

      <div className="space-y-2.5">
        {rows.map((row) => (
          <Link
            key={row.key}
            href={`/admin/leads?platform=${platform}&partner=${row.key}`}
            className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs transition hover:bg-white/[0.05]"
          >
            <span className="min-w-0 truncate text-white/60">
              {row.label}
            </span>
            <span className="font-bold text-white/85">
              {row.value}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
