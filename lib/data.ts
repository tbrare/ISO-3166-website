import { maakServerClient } from './supabase/server';
import { domeinInTaal, naarNorm, normInTaal, NORM_SELECT, NORM_SELECT_PUBLIEK, type Domein, type Norm, type NormRij, type Relatie } from './types';

/** Haalt alles op wat de site nodig heeft. RLS bepaalt wat zichtbaar is. */
export async function haalRegisterOp(opties: { alleenBevestigd?: boolean; taal?: 'nl' | 'en' } = {}): Promise<{
  domeinen: Domein[];
  normen: Norm[];
  relaties: Relatie[];
  fout: string | null;
}> {
  const supabase = await maakServerClient();
  let normenQuery = supabase
    .from('normen')
    .select(opties.alleenBevestigd ? NORM_SELECT_PUBLIEK : NORM_SELECT)
    .order('code');
  let relatiesQuery = supabase.from('relaties').select('id, van_norm_id, naar_norm_id, type, status');
  if (opties.alleenBevestigd) {
    normenQuery = normenQuery.eq('status', 'bevestigd');
    relatiesQuery = relatiesQuery.eq('status', 'bevestigd');
  }
  const [d, n, r] = await Promise.all([
    supabase.from('domeinen').select('id, naam, omschrijving, volgorde, naam_en, omschrijving_en').order('volgorde'),
    normenQuery,
    relatiesQuery,
  ]);
  const fout = d.error?.message ?? n.error?.message ?? r.error?.message ?? null;
  const taal = opties.taal ?? 'nl';
  const normen = ((n.data ?? []) as unknown as NormRij[]).map(naarNorm).map((x) => normInTaal(x, taal));
  const zichtbaar = new Set(normen.map((x) => x.id));
  const relaties = ((r.data ?? []) as Relatie[]).filter(
    (x) => zichtbaar.has(x.van_norm_id) && zichtbaar.has(x.naar_norm_id)
  );
  const domeinen = ((d.data ?? []) as Domein[]).map((x) => domeinInTaal(x, taal));
  return { domeinen, normen, relaties, fout };
}
