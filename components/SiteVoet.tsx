import Link from 'next/link';
import { TEKSTEN, type Taal } from '@/lib/i18n';

export default function SiteVoet({ taal }: { taal: Taal }) {
  const t = TEKSTEN[taal];
  return (
    <footer className="voet">
      <span>
        iso3166.nl · {t.openData}: <a href="/api/normen">/api/normen</a> (JSON)
      </span>
      <Link href="/beheer" className="beheer-link" rel="nofollow">
        {t.beheer}
      </Link>
    </footer>
  );
}
