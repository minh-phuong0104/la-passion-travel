'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/admin/auth';

export type UpdateLeadState = { error: string | null };

const statuses = new Set(['new', 'contacted', 'qualified', 'won', 'lost']);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function updateLead(_previous: UpdateLeadState, formData: FormData): Promise<UpdateLeadState> {
  // Authenticate the mutation itself: a direct POST does not need to render the page first.
  const { supabase } = await requireStaff();
  const id = formData.get('id');
  const status = formData.get('status');
  const assignee = formData.get('assigned_to');
  const note = formData.get('sales_note');
  if (typeof id !== 'string' || !uuid.test(id) || typeof status !== 'string' || !statuses.has(status) ||
      typeof assignee !== 'string' || (assignee && !uuid.test(assignee)) || typeof note !== 'string' || note.length > 10000) {
    return { error: 'Please check the lead details and try again.' };
  }

  const { error } = await supabase.from('leads')
    .update({ status, assigned_to: assignee || null, sales_note: note.trim() || null })
    .eq('id', id).select('id').single();
  if (error) {
    console.error('[admin/leads] update failed', error.code);
    return { error: 'Could not save this lead. Please try again.' };
  }
  revalidatePath('/admin/leads');
  revalidatePath(`/admin/leads/${id}`);
  redirect(`/admin/leads/${id}?saved=1`);
}
