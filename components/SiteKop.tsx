import Link from 'next/link';
import TaalKnop from './TaalKnop';
import { TEKSTEN, type Taal } from '@/lib/i18n';

interface Props {
  beheer?: boolean;
  actief?: 'normen' | 'domeinen' | 'web' | 'over';
  taal?: Taal;
}

export default function SiteKop({ beheer = false, actief, taal = 'nl' }: Props) {
  const t = TEKSTEN[taal];
  return (
    <header className="kop">
      <div className="kop-binnen">
        <Link href="/" className="logo">
          <span className="logo-naam">{beheer ? TEKSTEN.nl.siteNaam : t.siteNaam}</span>
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
          <div className="kop-rechts">
            <nav className="menu publiek" aria-label={t.hoofdmenu}>
              <Link href="/" className={actief === 'web' ? 'actief' : undefined} aria-current={actief === 'web' ? 'page' : undefined}>
                {t.menuKaart}
              </Link>
              <Link href="/over-iso3166" className={actief === 'over' ? 'actief' : undefined} aria-current={actief === 'over' ? 'page' : undefined}>
                {t.menuOver}
              </Link>
            </nav>
            <TaalKnop taal={taal} label={t.taalKeuze} />
          </div>
        )}
      </div>
    </header>
  );
}
