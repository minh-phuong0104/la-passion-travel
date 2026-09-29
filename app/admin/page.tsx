import Link from 'next/link';

import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  dateTime,
  leadSourceLabel,
  listOrDash,
  phoneNumber,
  statusStyle,
  textOrDash,
  titleCase,
} from '@/components/admin/lead-display';
import { requireStaff } from '@/lib/auth/require-staff';

export const dynamic = 'force-dynamic';

type RecentLead = {
  id: string;
  full_name: string;
  phone: string;
  country_code: string;
  email: string | null;
  destinations: unknown;
  budget: string | null;
  traffic_type: string;
  traffic_channel: string;
  first_touch_source: string | null;
  first_touch_referrer: string | null;
  status: string;
  created_at: string;
};

export default async function AdminPage() {
  const { supabase, profile } = await requireStaff();

  const [
    totalResult,
    newResult,
    contactedResult,
    qualifiedResult,
    wonResult,
    instagramResult,
    facebookResult,
    gfiResult,
    recentResult,
  ] = await Promise.all([
    supabase.from('leads').select('id', { count: 'exact', head: true }),
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'contacted'),
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'qualified'),
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'won'),

    // Reliable when campaign links use lowercase utm_source=instagram / facebook / gfi.
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .in('first_touch_source', ['instagram', 'ig']),
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .in('first_touch_source', ['facebook', 'fb']),
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('first_touch_source', 'gfi'),

    supabase
      .from('leads')
      .select(
        'id,full_name,phone,country_code,email,destinations,budget,traffic_type,traffic_channel,first_touch_source,first_touch_referrer,status,created_at',
      )
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const total = totalResult.count ?? 0;
  const newCount = newResult.count ?? 0;
  const contactedCount = contactedResult.count ?? 0;
  const qualifiedCount = qualifiedResult.count ?? 0;
  const wonCount = wonResult.count ?? 0;

  const instagramCount = instagramResult.count ?? 0;
  const facebookCount = facebookResult.count ?? 0;
  const gfiCount = gfiResult.count ?? 0;

  const recentLeads = (recentResult.data ?? []) as RecentLead[];

  const hasError = Boolean(
    totalResult.error ||
      newResult.error ||
      contactedResult.error ||
      qualifiedResult.error ||
      wonResult.error ||
      instagramResult.error ||
      facebookResult.error ||
      gfiResult.error ||
      recentResult.error,
  );

  const cards = [
    { label: 'Total leads', value: total, href: '/admin/leads' },
    { label: 'New', value: newCount, href: '/admin/leads?status=new' },
    { label: 'Contacted', value: contactedCount, href: '/admin/leads?status=contacted' },
    { label: 'Qualified', value: qualifiedCount, href: '/admin/leads?status=qualified' },
    { label: 'Won', value: wonCount, href: '/admin/leads?status=won' },
  ];

  const sources = [
    { label: 'Instagram', value: instagramCount },
    { label: 'Facebook', value: facebookCount },
    { label: 'GFI', value: gfiCount },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <AdminHeader name={profile.full_name || profile.email} role={profile.role} />

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-olive">
              La Passion Travel
            </p>
            <h1 className="font-serif text-5xl font-semibold leading-none text-forest sm:text-6xl">
              Admin Dashboard
            </h1>
            <p className="mt-3 text-sm text-olive">
              Welcome back, {profile.full_name || profile.email}. Here is the latest sales activity.
            </p>
          </div>

          <Link
            href="/admin/leads"
            className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal"
          >
            View all leads →
          </Link>
        </div>

        {hasError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
            Some dashboard data could not be loaded. Try refreshing the page.
          </div>
        )}

        <section aria-label="Lead overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-forest/10 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-olive">
                {card.label}
              </p>
              <p className="mt-3 font-serif text-4xl leading-none text-forest">{card.value}</p>
              <p className="mt-3 text-xs font-medium text-olive transition group-hover:text-forest">
                Open leads →
              </p>
            </Link>
          ))}
        </section>

        <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-forest/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-olive">
                Acquisition source
              </p>
              <h2 className="mt-1 font-serif text-2xl text-forest">Where leads came from</h2>
            </div>
            <p className="text-xs text-olive">
              Uses first-touch UTM source
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {sources.map((source) => (
              <div key={source.label} className="rounded-xl bg-cream/70 px-4 py-4 ring-1 ring-forest/10">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-olive">
                  {source.label}
                </p>
                <p className="mt-2 font-serif text-3xl text-forest">{source.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-forest/10">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-forest/10 px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-olive">
                Latest enquiries
              </p>
              <h2 className="mt-1 font-serif text-3xl text-forest">Recent leads</h2>
            </div>

            <Link href="/admin/leads" className="text-sm font-semibold text-forest hover:text-teal">
              View all →
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <h3 className="font-serif text-3xl text-forest">No leads yet</h3>
              <p className="mt-2 text-sm text-olive">
                New customer enquiries will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] border-collapse text-left">
                <thead className="bg-forest/[0.035] text-xs font-semibold uppercase tracking-[0.13em] text-olive">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-4 py-4">Trip</th>
                    <th className="px-4 py-4">Budget</th>
                    <th className="px-4 py-4">Source</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-6 py-4">Received</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-forest/10">
                  {recentLeads.map((lead) => (
                    <tr key={lead.id} className="align-top transition hover:bg-cream/45">
                      <td className="px-6 py-5">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="font-semibold text-forest underline-offset-4 hover:underline"
                        >
                          {lead.full_name}
                        </Link>
                        <p className="mt-1 text-sm text-olive">
                          {phoneNumber(lead.phone, lead.country_code)}
                        </p>
                        {lead.email && <p className="mt-1 text-xs text-olive/80">{lead.email}</p>}
                      </td>

                      <td className="max-w-56 px-4 py-5 text-sm text-ink">
                        <span className="line-clamp-2">{listOrDash(lead.destinations)}</span>
                      </td>

                      <td className="px-4 py-5 text-sm text-ink">{textOrDash(lead.budget)}</td>

                      <td className="px-4 py-5 text-sm text-ink">
                        <span className="font-semibold text-forest">
                          {leadSourceLabel(
                            lead.first_touch_source,
                            lead.first_touch_referrer,
                            lead.traffic_channel,
                          )}
                        </span>
                        <span className="mt-1 block text-xs text-olive">
                          {titleCase(lead.traffic_type)} · {titleCase(lead.traffic_channel)}
                        </span>
                      </td>

                      <td className="px-4 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${statusStyle(
                            lead.status,
                          )}`}
                        >
                          {titleCase(lead.status)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm text-olive">
                        {dateTime(lead.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
