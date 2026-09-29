import 'server-only';

import type { SupabaseClient, User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export type StaffRole = 'admin' | 'sales';

export type StaffProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: StaffRole;
};

function isStaffProfile(value: unknown): value is StaffProfile {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Record<string, unknown>;
  return (
    typeof profile.id === 'string' &&
    typeof profile.email === 'string' &&
    (profile.full_name === null || typeof profile.full_name === 'string') &&
    (profile.role === 'admin' || profile.role === 'sales')
  );
}

/** Always call this in protected pages and Server Actions, even with proxy.ts. */
export async function requireStaff(): Promise<{
  supabase: SupabaseClient;
  user: User;
  profile: StaffProfile;
}> {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) redirect('/admin/login');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id,email,full_name,role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !isStaffProfile(profile)) {
    redirect('/admin/login?error=forbidden');
  }

  return { supabase, user, profile };
}
