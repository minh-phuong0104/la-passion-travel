'use client';

import { useActionState } from 'react';
import { updateLead, type UpdateLeadState } from '@/app/admin/leads/[id]/actions';

type Salesperson = { id: string; full_name: string | null; email: string };

const initialState: UpdateLeadState = { error: null };

export function LeadStatusForm({ id, status, assignedTo, salesNote, staff }: {
  id: string;
  status: string;
  assignedTo: string | null;
  salesNote: string | null;
  staff: Salesperson[];
}) {
  const [state, action, pending] = useActionState(updateLead, initialState);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="id" value={id} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-olive">Status</span>
          <select name="status" defaultValue={status} className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm text-ink">
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-olive">Assigned to</span>
          <select name="assigned_to" defaultValue={assignedTo ?? ''} className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm text-ink">
            <option value="">Unassigned</option>
            {staff.map(person => <option key={person.id} value={person.id}>{person.full_name || person.email}</option>)}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-olive">Sales notes</span>
        <textarea name="sales_note" defaultValue={salesNote ?? ''} maxLength={10000} rows={7} placeholder="Add follow-up details, preferences, or next steps…" className="w-full resize-y rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm leading-6 text-ink placeholder:text-olive/60" />
      </label>
      {state.error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending} className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal disabled:cursor-wait disabled:opacity-60">
        {pending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}
