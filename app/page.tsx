import SiteKop from '@/components/SiteKop';
import RegisterWeergave from '@/components/RegisterWeergave';
import { haalRegisterOp } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { domeinen, normen, relaties, fout } = await haalRegisterOp({ alleenBevestigd: true });

  return (
    <>
      <SiteKop />
      {fout && (
        <div className="sectie">
          <p className="foutmelding" role="alert">De gegevens konden niet worden geladen: {fout}</p>
        </div>
      )}
      <RegisterWeergave domeinen={domeinen} normen={normen} relaties={relaties} />
      <section id="iso3166" className="sectie">
        <div className="raster">
          <div className="cijfer"><p className="bovenregel" style={{ margin: 0 }}>ISO 3166-1</p><p style={{ margin: '6px 0 0' }}>Landen: alpha-2 <b className="mono">NL</b>, alpha-3 <b className="mono">NLD</b>, numeriek <b className="mono">528</b>.</p></div>
          <div className="cijfer"><p className="bovenregel" style={{ margin: 0 }}>ISO 3166-2</p><p style={{ margin: '6px 0 0' }}>Onderverdelingen, zoals provincies: <b className="mono">NL-UT</b> voor Utrecht.</p></div>
          <div className="cijfer"><p className="bovenregel" style={{ margin: 0 }}>ISO 3166-3</p><p style={{ margin: '6px 0 0' }}>Vervallen landnamen en -codes, zoals Joegoslavië en de Nederlandse Antillen.</p></div>
        </div>
      </section>
      <footer className="voet">
        iso3166.nl · Open data: <a href="/api/normen">/api/normen</a> (JSON)
      </footer>
    </>
  );
}
