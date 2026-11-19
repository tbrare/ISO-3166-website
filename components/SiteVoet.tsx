import Link from 'next/link';
import { TEKSTEN, type Taal } from '@/lib/i18n';

export default function SiteVoet({ taal }: { taal: Taal }) {
  const t = TEKSTEN[taal];
  return (
    <footer className="voet">
      <span>iso3166.nl</span>
      <Link href="/beheer" className="beheer-link" rel="nofollow">
        {t.beheer}
      </Link>
    </footer>
  );
}
