import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { LeadStatusForm } from '@/components/admin/LeadStatusForm';
import { dateTime, listOrDash, phoneNumber, statusStyle, textOrDash, titleCase } from '@/components/admin/lead-display';
import { requireStaff } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Lead details | La Passion Admin', robots: { index: false, follow: false } };

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

type Staff = { id: string; email: string; full_name: string | null; role: 'admin' | 'sales' };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function Field({ label, value, wrap = false }: { label: string; value: string | number | null | undefined; wrap?: boolean }) {
  return <div className="min-w-0">
    <dt className="text-xs font-semibold uppercase tracking-[0.13em] text-olive">{label}</dt>
    <dd className={`mt-1 text-sm leading-6 text-ink ${wrap ? 'break-all' : 'break-words'}`}>{value === null || value === undefined || value === '' ? '—' : value}</dd>
  </div>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-forest/10 sm:p-7">
    <h2 className="mb-6 font-serif text-3xl font-semibold text-forest">{title}</h2>
    {children}
  </section>;
}

export default async function LeadDetailPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase, profile } = await requireStaff();
  const { id } = await params;
  if (!uuid.test(id)) notFound();

  const [{ data, error }, { data: staffData, error: staffError }] = await Promise.all([
    supabase.from('leads').select('*').eq('id', id).maybeSingle(),
    supabase.from('profiles').select('id,email,full_name,role').order('full_name', { ascending: true }),
  ]);
  const saved = (await searchParams).saved === '1';

  if (error) {
    return <div className="min-h-screen bg-cream">
      <AdminHeader name={profile.full_name || profile.email} role={profile.role} />
      <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <Link href="/admin/leads" className="text-sm font-semibold text-forest hover:underline">← Back to leads</Link>
        <div role="alert" className="mt-8 rounded-2xl bg-white p-10 text-center ring-1 ring-forest/10">
          <h1 className="font-serif text-3xl text-forest">Lead could not be loaded</h1>
          <p className="mt-2 text-sm text-olive">Please refresh the page or try again shortly.</p>
        </div>
      </main>
    </div>;
  }
  if (!data) notFound();
  const lead = data as Lead;
  const staff = (staffData ?? []) as Staff[];
  const assigned = staff.find(person => person.id === lead.assigned_to);
  const phone = phoneNumber(lead.phone, lead.country_code);

  return (
    <div className="min-h-screen bg-cream">
      <AdminHeader name={profile.full_name || profile.email} role={profile.role} />
      <main className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
        <Link href="/admin/leads" className="text-sm font-semibold text-forest hover:underline">← Back to leads</Link>
        <div className="mb-8 mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-olive">Customer enquiry</p>
            <h1 className="font-serif text-5xl font-semibold leading-none text-forest sm:text-6xl">{lead.full_name}</h1>
            <p className="mt-3 text-sm text-olive">Received {dateTime(lead.created_at)} · Last updated {dateTime(lead.updated_at)}</p>
          </div>
          <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ring-1 ${statusStyle(lead.status)}`}>{titleCase(lead.status)}</span>
        </div>
        {saved && <p role="status" className="mb-6 rounded-xl bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-800 ring-1 ring-emerald-100">Lead changes saved.</p>}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(340px,1fr)]">
          <div className="space-y-6">
            <Section title="Customer">
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <Field label="Full name" value={lead.full_name} />
                <Field label="Phone" value={phone} />
                <Field label="Email" value={lead.email} />
                <Field label="Country code" value={lead.country_code} />
              </dl>
            </Section>

            <Section title="Trip">
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <Field label="Destinations" value={listOrDash(lead.destinations)} />
                <Field label="Trip duration" value={textOrDash(lead.duration)} />
                <Field label="Departure date" value={textOrDash(lead.travel_date)} />
                <Field label="Custom duration" value={textOrDash(lead.custom_duration)} />
                <Field label="Companion type" value={textOrDash(lead.companion_type)} />
                <Field label="Traveler count" value={lead.traveler_count} />
                <Field label="Pace" value={textOrDash(lead.travel_pace)} />
              </dl>
            </Section>

            <Section title="Interests & budget">
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <Field label="Experiences" value={listOrDash(lead.experiences)} />
                <Field label="Budget" value={textOrDash(lead.budget)} />
              </dl>
              <div className="mt-5 border-t border-forest/10 pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-olive">Special requests</p>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-ink">{textOrDash(lead.special_requests)}</p>
              </div>
            </Section>

            <Section title="Source & attribution">
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

          <div className="space-y-6 lg:sticky lg:top-6">
            <Section title="Sales follow-up">
              <p className="mb-6 text-sm text-olive">Currently assigned to <span className="font-semibold text-ink">{assigned?.full_name || assigned?.email || 'nobody'}</span>.</p>
              {staffError ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">Sales team could not be loaded. Please try again shortly.</p> :
                <LeadStatusForm id={lead.id} status={lead.status} assignedTo={lead.assigned_to} salesNote={lead.sales_note} staff={staff} />}
            </Section>
            <div className="rounded-2xl bg-forest px-6 py-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/65">Lead record</p>
              <p className="mt-3 break-all text-xs leading-6 text-white/85">Submission ID: {lead.submission_id}</p>
              <p className="mt-1 text-xs text-white/65">Created {dateTime(lead.created_at)}</p>
              <p className="mt-1 text-xs text-white/65">Updated {dateTime(lead.updated_at)}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
