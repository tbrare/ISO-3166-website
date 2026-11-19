'use client';

import { useRouter } from 'next/navigation';
import { TAAL_COOKIE, type Taal } from '@/lib/i18n';

export default function TaalKnop({ taal, label }: { taal: Taal; label: string }) {
  const router = useRouter();

  const kies = (nieuw: Taal) => {
    if (nieuw === taal) return;
    document.cookie = `${TAAL_COOKIE}=${nieuw}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };

  return (
    <div className="taalknop" role="group" aria-label={label}>
      <button type="button" lang="nl" aria-pressed={taal === 'nl'} onClick={() => kies('nl')}>
        NL<span className="verborgen"> – Nederlands</span>
      </button>
      <button type="button" lang="en" aria-pressed={taal === 'en'} onClick={() => kies('en')}>
        EN<span className="verborgen"> – English</span>
      </button>
    </div>
  );
}
