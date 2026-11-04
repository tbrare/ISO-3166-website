import SiteKop from '@/components/SiteKop';
import DomeinenBeheer from '@/components/beheer/DomeinenBeheer';
import { haalRegisterOp } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Beheer domeinen – iso3166.nl' };

export default async function DomeinenPagina() {
  const { domeinen, normen } = await haalRegisterOp();
  const aantallen: Record<string, number> = {};
  for (const n of normen) {
    for (const id of [n.hoofddomein_id, ...n.extra_domein_ids]) {
      if (id) aantallen[id] = (aantallen[id] ?? 0) + 1;
    }
  }
  return (
    <>
      <SiteKop beheer actief="domeinen" />
      <DomeinenBeheer domeinen={domeinen} aantallen={aantallen} />
    </>
  );
}
