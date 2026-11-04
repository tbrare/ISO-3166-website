import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { naarNorm, type NormRij } from '@/lib/types';

export const dynamic = 'force-dynamic';

/** Open data: alle gepubliceerde normen, domeinen en relaties als JSON. */
export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const [d, n, r] = await Promise.all([
    supabase.from('domeinen').select('id, naam, omschrijving, volgorde').order('volgorde'),
    supabase.from('normen').select('*, norm_domeinen(domein_id)').order('code'),
    supabase.from('relaties').select('id, van_norm_id, naar_norm_id, type, status'),
  ]);
  const fout = d.error ?? n.error ?? r.error;
  if (fout) return NextResponse.json({ fout: fout.message }, { status: 500 });

  return NextResponse.json(
    {
      bron: 'iso3166.nl',
      gegenereerd: new Date().toISOString(),
      domeinen: d.data,
      normen: ((n.data ?? []) as NormRij[]).map(naarNorm),
      relaties: r.data,
    },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
  );
}
