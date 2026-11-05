import SiteKop from '@/components/SiteKop';
import RegisterWeergave from '@/components/RegisterWeergave';
import { haalRegisterOp } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { domeinen, normen, relaties, fout } = await haalRegisterOp({ alleenBevestigd: true });

  return (
    <>
      <SiteKop actief="web" />
      {fout && (
        <div className="sectie">
          <p className="foutmelding" role="alert">De gegevens konden niet worden geladen: {fout}</p>
        </div>
      )}
      <main>
        <RegisterWeergave domeinen={domeinen} normen={normen} relaties={relaties} />
      </main>
      <footer className="voet">
        iso3166.nl · <a href="/over-iso3166">Over ISO 3166</a> · Open data: <a href="/api/normen">/api/normen</a> (JSON)
      </footer>
    </>
  );
}
