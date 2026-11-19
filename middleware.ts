import type { NextRequest } from 'next/server';
import { verversSessie } from '@/lib/supabase/middleware';
import { isTaal, TAAL_COOKIE } from '@/lib/i18n';

export async function middleware(request: NextRequest) {
  // Deelbare links: ?lang=en of ?lang=nl zet de taal (en onthoudt die)
  const gevraagd = request.nextUrl.searchParams.get('lang');
  const taal = isTaal(gevraagd) ? gevraagd : null;
  if (taal) request.cookies.set(TAAL_COOKIE, taal);

  const response = await verversSessie(request);
  if (taal) response.cookies.set(TAAL_COOKIE, taal, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
