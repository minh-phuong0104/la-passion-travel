import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { LeadStatusForm } from "@/components/admin/LeadStatusForm";
import {
  dateTime,
  listOrDash,
  phoneNumber,
  textOrDash,
  titleCase,
} from "@/components/admin/lead-display";
import { sourceDisplay } from "@/lib/admin/partner-sources";
import { requireStaff } from "@/lib/auth/require-staff";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lead details | La Passion Admin",
  robots: {
    index: false,
    follow: false,
  },
};

type Lead = {
  id: string;
  submission_id: string;
  full_name: string;
  email: string | null;
  phone: string;
  country_code: string;
  destinations: unknown;
  duration: string | null;
  travel_date: string | null;
  custom_duration: string | null;
  companion_type: string | null;
  traveler_count: number | null;
  experiences: unknown;
  travel_pace: string | null;
  budget: string | null;
  special_requests: string | null;
  traffic_type: string;
  traffic_channel: string;
  first_touch_source: string | null;
  first_touch_content: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  fbclid: string | null;
  gclid: string | null;
  status: string;
  assigned_to: string | null;
  sales_note: string | null;
  created_at: string;
  updated_at: string;
};

type Staff = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "sales";
};

const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function Field({
  label,
  value,
  wrap = false,
}: {
  label: string;
  value: string | number | null | undefined;
  wrap?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
        {label}
      </dt>
      <dd
        className={`mt-1.5 text-sm leading-6 text-white/75 ${
          wrap ? "break-all" : "break-words"
        }`}
      >
        {value === null || value === undefined || value === "" ? "—" : value}
      </dd>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[22px] bg-[#1d1b18] p-6 text-white shadow-[0_12px_28px_rgba(0,0,0,0.10)] sm:p-7">
      <h2 className="mb-6 text-2xl font-bold tracking-[-0.025em]">{title}</h2>
      {children}
    </section>
  );
}

function statusClass(status: string) {
  if (status === "won") return "border-[#00c58a]/35 bg-[#00c58a]/10 text-[#00c58a]";
  if (status === "qualified")
    return "border-[#f0bd1a]/35 bg-[#f0bd1a]/10 text-[#f0bd1a]";
  if (status === "lost") return "border-red-400/30 bg-red-500/10 text-red-300";
  return "border-white/10 bg-white/[0.05] text-white/70";
}

export default async function LeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase, profile } = await requireStaff();
  const { id } = await params;

  if (!uuid.test(id)) notFound();

  const [
    { data, error },
    { data: staffData, error: staffError },
  ] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("profiles")
      .select("id,email,full_name,role")
      .order("full_name", { ascending: true }),
  ]);

  const saved = (await searchParams).saved === "1";

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f5f0]">
        <AdminHeader name={profile.full_name || profile.email} role={profile.role} />
        <main className="px-4 py-8 lg:ml-[260px] lg:px-8">
          <div className="mx-auto max-w-4xl rounded-[22px] bg-[#1d1b18] p-10 text-center text-white">
            <h1 className="text-3xl font-bold">Lead could not be loaded</h1>
            <p className="mt-2 text-sm text-white/45">Refresh the page or try again shortly.</p>
            <Link
              href="/admin/leads"
              className="mt-6 inline-flex rounded-xl bg-[#00c58a] px-5 py-3 text-sm font-bold text-[#10231d]"
            >
              ← Back to leads
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!data) notFound();

  const lead = data as Lead;
  const staff = (staffData ?? []) as Staff[];
  const assigned = staff.find((person) => person.id === lead.assigned_to);
  const phone = phoneNumber(lead.phone, lead.country_code);
  const source = sourceDisplay({
    source: lead.first_touch_source,
    content: lead.first_touch_content,
    trafficChannel: lead.traffic_channel,
  });

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#1d1b18]">
      <AdminHeader name={profile.full_name || profile.email} role={profile.role} />

      <main className="px-4 py-6 sm:px-6 lg:ml-[260px] lg:px-8 lg:py-8 xl:px-10">
        <div className="mx-auto max-w-[1500px]">
          <Link
            href="/admin/leads"
            className="text-sm font-bold text-[#5d594f] hover:text-[#1d1b18]"
          >
            ← Back to leads
          </Link>

          <section className="mt-5 rounded-[22px] bg-[#1d1b18] px-6 py-7 text-white shadow-[0_16px_36px_rgba(0,0,0,0.12)] sm:px-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#00c58a]">
                  Customer enquiry
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                  {lead.full_name}
                </h1>
                <p className="mt-2 text-sm text-white/45">
                  Received {dateTime(lead.created_at)} · Updated {dateTime(lead.updated_at)}
                </p>
              </div>

              <span
                className={`inline-flex rounded-full border px-4 py-2 text-sm font-bold ${statusClass(
                  lead.status,
                )}`}
              >
                {titleCase(lead.status)}
              </span>
            </div>
          </section>

          {saved && (
            <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-800">
              Lead changes saved.
            </p>
          )}

          <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,.8fr)]">
            <div className="space-y-6">
              <Section title="Customer">
                <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  <Field label="Full name" value={lead.full_name} />
                  <Field label="Phone" value={phone} />
                  <Field label="Email" value={lead.email} />
                  <Field label="Country code" value={lead.country_code} />
                </dl>
              </Section>

              <Section title="Journey">
                <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  <Field label="Destinations" value={listOrDash(lead.destinations)} />
                  <Field label="Trip duration" value={textOrDash(lead.duration)} />
                  <Field label="Departure date" value={textOrDash(lead.travel_date)} />
                  <Field label="Custom duration" value={textOrDash(lead.custom_duration)} />
                  <Field label="Companion type" value={textOrDash(lead.companion_type)} />
                  <Field label="Traveler count" value={lead.traveler_count} />
                  <Field label="Pace" value={textOrDash(lead.travel_pace)} />
                  <Field label="Experiences" value={listOrDash(lead.experiences)} />
                  <Field label="Budget" value={textOrDash(lead.budget)} />
                </dl>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
                    Special requests
                  </p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-white/70">
                    {textOrDash(lead.special_requests)}
                  </p>
                </div>
              </Section>

              <Section title="Attribution">
                <div className="mb-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#00c58a]/20 bg-[#00c58a]/10 px-4 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#00c58a]">
                      Platform
                    </p>
                    <p className="mt-2 text-lg font-bold text-white">
                      {source.platform}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#00c58a]/20 bg-[#00c58a]/10 px-4 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#00c58a]">
                      Partner account
                    </p>
                    <p className="mt-2 text-lg font-bold text-white">
                      {source.partner || "—"}
                    </p>
                  </div>
                </div>

                <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  <Field label="Traffic type" value={titleCase(lead.traffic_type)} />
                  <Field label="Traffic channel" value={titleCase(lead.traffic_channel)} />
                  <Field label="UTM source" value={textOrDash(lead.utm_source)} />
                  <Field label="UTM medium" value={textOrDash(lead.utm_medium)} />
                  <Field label="UTM campaign" value={textOrDash(lead.utm_campaign)} />
                  <Field label="UTM content" value={textOrDash(lead.utm_content)} />
                  <Field label="UTM term" value={textOrDash(lead.utm_term)} />
                  <Field label="fbclid" value={textOrDash(lead.fbclid)} wrap />
                  <Field label="gclid" value={textOrDash(lead.gclid)} wrap />
                </dl>
              </Section>
            </div>

            <div className="space-y-6 xl:sticky xl:top-6">
              <Section title="Sales Follow-up">
                <p className="mb-6 text-sm text-white/50">
                  Assigned to{" "}
                  <span className="font-bold text-white/80">
                    {assigned?.full_name || assigned?.email || "nobody"}
                  </span>
                  .
                </p>

                {staffError ? (
                  <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    Sales team could not be loaded.
                  </p>
                ) : (
                  <LeadStatusForm
                    id={lead.id}
                    status={lead.status}
                    assignedTo={lead.assigned_to}
                    salesNote={lead.sales_note}
                    staff={staff}
                  />
                )}
              </Section>

              <div className="rounded-[22px] border border-[#00c58a]/30 bg-[#083e34] px-6 py-5 text-white shadow-[0_12px_28px_rgba(0,0,0,0.10)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#00c58a]">
                  Lead record
                </p>
                <p className="mt-3 break-all text-xs leading-6 text-white/65">
                  Submission ID: {lead.submission_id}
                </p>
                <p className="mt-1 text-xs text-white/45">Created {dateTime(lead.created_at)}</p>
                <p className="mt-1 text-xs text-white/45">Updated {dateTime(lead.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
