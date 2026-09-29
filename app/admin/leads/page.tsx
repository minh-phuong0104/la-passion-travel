import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { dateTime, listOrDash, phoneNumber, statusStyle, textOrDash, titleCase } from '@/components/admin/lead-display';
import { requireStaff } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

type SearchParams = Record<string, string | string[] | undefined>;
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
  status: string;
  created_at: string;
};

const trafficTypes = ['all', 'paid', 'organic', 'direct', 'referral'] as const;
const statuses = ['all', 'new', 'contacted', 'qualified', 'won', 'lost'] as const;
const pageSize = 25;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

export default async function LeadsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { supabase, profile } = await requireStaff();
  const params = await searchParams;
  const trafficInput = first(params.traffic).toLowerCase();
  const statusInput = first(params.status).toLowerCase();
  const traffic = trafficTypes.find(item => item === trafficInput) ?? 'all';
  const status = statuses.find(item => item === statusInput) ?? 'all';
  const q = first(params.q).trim().slice(0, 80);
  const search = q.replace(/[^\p{L}\p{N}\s@.+_-]/gu, '').trim();
  const requestedPage = Number(first(params.page));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 10000) : 1;

  function href(changes: { traffic?: string; status?: string; q?: string; page?: number }) {
    const next = {
      traffic: changes.traffic ?? traffic,
      status: changes.status ?? status,
      q: changes.q ?? q,
      page: changes.page ?? 1,
    };
    const query = new URLSearchParams();
    if (next.traffic !== 'all') query.set('traffic', next.traffic);
    if (next.status !== 'all') query.set('status', next.status);
    if (next.q) query.set('q', next.q);
    if (next.page > 1) query.set('page', String(next.page));
    const encoded = query.toString();
    return `/admin/leads${encoded ? `?${encoded}` : ''}`;
  }

  let query = supabase.from('leads')
    .select('id,full_name,phone,country_code,email,destinations,duration,budget,traffic_type,traffic_channel,status,created_at', { count: 'exact' });
  if (traffic !== 'all') query = query.eq('traffic_type', traffic);
  if (status !== 'all') query = query.eq('status', status);
  if (search) query = query.or(`full_name.ilike.*${search}*,phone.ilike.*${search}*,email.ilike.*${search}*`);
  const { data, error, count } = await query.order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  const leads = (data ?? []) as LeadSummary[];
  const total = count ?? 0;
  const pageCount = Math.ceil(total / pageSize);

  const chip = (active: boolean) => `inline-flex min-h-9 items-center rounded-full px-4 py-2 text-sm font-medium transition ${active ? 'bg-forest text-white shadow-sm' : 'bg-white text-forest ring-1 ring-forest/15 hover:bg-cream'}`;

  return (
    <div className="min-h-screen bg-cream">
      <AdminHeader name={profile.full_name || profile.email} role={profile.role} />
      <main className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-olive">Customer enquiries</p>
            <h1 className="font-serif text-5xl font-semibold leading-none text-forest sm:text-6xl">Leads</h1>
            <p className="mt-3 text-sm text-olive">Review enquiries and keep every conversation moving.</p>
          </div>
          {!error && <div className="rounded-2xl bg-white px-5 py-4 text-right shadow-sm ring-1 ring-forest/10">
            <p className="font-serif text-3xl leading-none text-forest">{total}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-olive">Matching leads</p>
          </div>}
        </div>

        <section aria-label="Lead filters" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-forest/10 sm:p-6">
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-olive">Traffic type</p>
              <div className="flex flex-wrap gap-2">
                {trafficTypes.map(item => <Link key={item} href={href({ traffic: item })} aria-current={traffic === item ? 'page' : undefined} className={chip(traffic === item)}>{titleCase(item)}</Link>)}
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-olive">Status</p>
              <div className="flex flex-wrap gap-2">
                {statuses.map(item => <Link key={item} href={href({ status: item })} aria-current={status === item ? 'page' : undefined} className={chip(status === item)}>{titleCase(item)}</Link>)}
              </div>
            </div>
            <form method="get" action="/admin/leads" className="flex flex-wrap items-end gap-3 border-t border-forest/10 pt-5">
              {traffic !== 'all' && <input type="hidden" name="traffic" value={traffic} />}
              {status !== 'all' && <input type="hidden" name="status" value={status} />}
              <label className="min-w-[220px] flex-1">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-olive">Search customers</span>
                <input name="q" type="search" defaultValue={q} maxLength={80} placeholder="Name, phone, or email" className="w-full rounded-xl border border-forest/15 bg-cream/40 px-4 py-3 text-sm text-ink placeholder:text-olive/60" />
              </label>
              <button type="submit" className="rounded-xl bg-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal">Search</button>
              {(q || status !== 'all' || traffic !== 'all') && <Link href="/admin/leads" className="px-2 py-3 text-sm font-medium text-olive hover:text-forest">Clear filters</Link>}
            </form>
          </div>
        </section>

        <section aria-label="Lead list" className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-forest/10">
          {error ? (
            <div role="alert" className="px-6 py-16 text-center">
              <h2 className="font-serif text-3xl text-forest">Leads could not be loaded</h2>
              <p className="mt-2 text-sm text-olive">Please refresh the page or try again shortly.</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <h2 className="font-serif text-3xl text-forest">No leads found</h2>
              <p className="mt-2 text-sm text-olive">Try another search or change the filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-left">
                <thead className="bg-forest/[0.035] text-xs font-semibold uppercase tracking-[0.13em] text-olive">
                  <tr>
                    <th scope="col" className="px-6 py-4">Customer</th>
                    <th scope="col" className="px-4 py-4">Trip</th>
                    <th scope="col" className="px-4 py-4">Budget</th>
                    <th scope="col" className="px-4 py-4">Source</th>
                    <th scope="col" className="px-4 py-4">Status</th>
                    <th scope="col" className="px-6 py-4">Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest/10">
                  {leads.map(lead => <tr key={lead.id} className="align-top transition hover:bg-cream/45">
                    <td className="px-6 py-5">
                      <Link href={`/admin/leads/${lead.id}`} className="font-semibold text-forest underline-offset-4 hover:underline">{lead.full_name}</Link>
                      <p className="mt-1 text-sm text-olive">{phoneNumber(lead.phone, lead.country_code)}</p>
                    </td>
                    <td className="max-w-52 px-4 py-5 text-sm text-ink">
                      <span className="line-clamp-2">{listOrDash(lead.destinations)}</span>
                      <span className="mt-1 block text-olive">{textOrDash(lead.duration)}</span>
                    </td>
                    <td className="px-4 py-5 text-sm text-ink">{textOrDash(lead.budget)}</td>
                    <td className="px-4 py-5 text-sm text-ink">
                      <span className="font-medium">{titleCase(lead.traffic_type)}</span>
                      <span className="mt-1 block text-olive">{titleCase(lead.traffic_channel)}</span>
                    </td>
                    <td className="px-4 py-5"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${statusStyle(lead.status)}`}>{titleCase(lead.status)}</span></td>
                    <td className="whitespace-nowrap px-6 py-5 text-sm text-olive">{dateTime(lead.created_at)}</td>
                  </tr>)}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {!error && pageCount > 1 && <nav aria-label="Lead pages" className="mt-6 flex items-center justify-between gap-3 text-sm text-olive">
          <span>Page {page} of {pageCount}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={href({ page: page - 1 })} className="rounded-full bg-white px-4 py-2 font-medium text-forest ring-1 ring-forest/15 hover:bg-forest hover:text-white">Previous</Link>}
            {page < pageCount && <Link href={href({ page: page + 1 })} className="rounded-full bg-white px-4 py-2 font-medium text-forest ring-1 ring-forest/15 hover:bg-forest hover:text-white">Next</Link>}
          </div>
        </nav>}
      </main>
    </div>
  );
}
