import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabasePublicConfig } from './config';

const noCacheHeaders = ['cache-control', 'expires', 'pragma'];

function copyAuthResponse(source: NextResponse, destination: NextResponse) {
  for (const cookie of source.cookies.getAll()) {
    destination.cookies.set(cookie);
  }
  for (const name of noCacheHeaders) {
    const value = source.headers.get(name);
    if (value) destination.headers.set(name, value);
  }
  destination.headers.set('Cache-Control', 'private, no-store');
  return destination;
}

export async function updateSession(request: NextRequest) {
  const config = getSupabasePublicConfig();
  if (!config) {
    if (request.nextUrl.pathname === '/admin/login') return NextResponse.next();
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers ?? {}).forEach(([name, value]) => {
          response.headers.set(name, value);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const isLogin = request.nextUrl.pathname === '/admin/login';
  if (!isLogin && (error || !data?.claims?.sub)) {
    return copyAuthResponse(
      response,
      NextResponse.redirect(new URL('/admin/login', request.url)),
    );
  }

  if (!isLogin) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data!.claims.sub)
      .maybeSingle();
    if (profileError || (profile?.role !== 'admin' && profile?.role !== 'sales')) {
      return copyAuthResponse(
        response,
        NextResponse.redirect(new URL('/admin/login?error=forbidden', request.url)),
      );
    }
  }

  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
