import { maakServerClient } from './supabase/server';
import { naarNorm, type Domein, type Norm, type NormRij, type Relatie } from './types';

/** Haalt alles op wat de site nodig heeft. RLS bepaalt wat zichtbaar is. */
export async function haalRegisterOp(): Promise<{
  domeinen: Domein[];
  normen: Norm[];
  relaties: Relatie[];
  fout: string | null;
}> {
  const supabase = await maakServerClient();
  const [d, n, r] = await Promise.all([
    supabase.from('domeinen').select('id, naam, omschrijving, volgorde').order('volgorde'),
    supabase.from('normen').select('*, norm_domeinen(domein_id)').order('code'),
    supabase.from('relaties').select('id, van_norm_id, naar_norm_id, type, status'),
  ]);
  const fout = d.error?.message ?? n.error?.message ?? r.error?.message ?? null;
  const normen = ((n.data ?? []) as NormRij[]).map(naarNorm);
  const zichtbaar = new Set(normen.map((x) => x.id));
  const relaties = ((r.data ?? []) as Relatie[]).filter(
    (x) => zichtbaar.has(x.van_norm_id) && zichtbaar.has(x.naar_norm_id)
  );
  return { domeinen: (d.data ?? []) as Domein[], normen, relaties, fout };
}
