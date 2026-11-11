import SiteKop from '@/components/SiteKop';
import InlogFormulier from '@/components/InlogFormulier';

export const metadata = { title: 'Inloggen – ISO 3166 Landencodes' };

export default function LoginPagina() {
  return (
    <div className="inlog-pagina">
      <SiteKop />
      <main className="inlog-midden">
        <div className="kaart inlog-kaart">
          <p className="bovenregel">Beheer</p>
          <h1 style={{ margin: 0, fontSize: 28 }}>Inloggen</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--tekst-2)' }}>Alleen voor de beheerder van het register.</p>
          <InlogFormulier />
        </div>
      </main>
    </div>
  );
}
