import Link from 'next/link';

export default function SiteKop({ beheer = false, actief }: { beheer?: boolean; actief?: 'normen' | 'domeinen' }) {
  return (
    <header className="kop">
      <div className="kop-binnen">
        <Link href="/" className="logo">
          <span className="logo-code">NL · NLD · 528</span>
          <span className="logo-naam">iso3166.nl</span>
          {beheer && <span className="logo-sub">Beheer</span>}
        </Link>
        {beheer ? (
          <nav className="menu" aria-label="Beheermenu">
            <Link href="/beheer" className={actief === 'normen' ? 'actief' : undefined} aria-current={actief === 'normen' ? 'page' : undefined}>
              Normen
            </Link>
            <Link href="/beheer/domeinen" className={actief === 'domeinen' ? 'actief' : undefined} aria-current={actief === 'domeinen' ? 'page' : undefined}>
              Domeinen
            </Link>
            <Link href="/">Bekijk site</Link>
            <form action="/auth/uitloggen" method="post">
              <button type="submit" className="link">Uitloggen</button>
            </form>
          </nav>
        ) : (
          <nav className="menu" aria-label="Hoofdmenu">
            <a href="#web">Spinnenweb</a>
            <a href="#register">Register</a>
            <a href="#iso3166">Over ISO 3166</a>
            <Link href="/beheer" className="knop-licht">Beheer</Link>
          </nav>
        )}
      </div>
    </header>
  );
}
