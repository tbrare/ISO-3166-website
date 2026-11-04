import SiteKop from '@/components/SiteKop';
import NormenBeheer from '@/components/beheer/NormenBeheer';
import { haalRegisterOp } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Beheer normen – iso3166.nl' };

export default async function BeheerPagina() {
  const { domeinen, normen, relaties, fout } = await haalRegisterOp();
  return (
    <>
      <SiteKop beheer actief="normen" />
      {fout && (
        <div className="sectie">
          <p className="foutmelding" role="alert">{fout}</p>
        </div>
      )}
      <NormenBeheer domeinen={domeinen} normen={normen} relaties={relaties} />
    </>
  );
}
