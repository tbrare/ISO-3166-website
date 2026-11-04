import type { NextRequest } from 'next/server';
import { verversSessie } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return verversSessie(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
