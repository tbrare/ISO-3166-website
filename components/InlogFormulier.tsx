'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { maakBrowserClient } from '@/lib/supabase/client';

export default function InlogFormulier() {
  const router = useRouter();
  const [naam, setNaam] = useState('');
  const [wachtwoord, setWachtwoord] = useState('');
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  async function inloggen(e: React.FormEvent) {
    e.preventDefault();
    setBezig(true);
    setFout(null);
    const domein = process.env.NEXT_PUBLIC_LOGIN_DOMEIN || 'iso3166.nl';
    const schoon = naam.trim().toLowerCase();
    const email = schoon.includes('@') ? schoon : `${schoon}@${domein}`;
    const supabase = maakBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: wachtwoord });
    setBezig(false);
    if (error) {
      setFout('Inloggen mislukt. Controleer je naam en wachtwoord.');
      return;
    }
    router.push('/beheer');
    router.refresh();
  }

  return (
    <form onSubmit={inloggen} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
      <div className="veld">
        <label htmlFor="naam">Naam</label>
        <input id="naam" type="text" autoComplete="username" required value={naam} onChange={(e) => setNaam(e.target.value)} />
      </div>
      <div className="veld">
        <label htmlFor="wachtwoord">Wachtwoord</label>
        <input id="wachtwoord" type="password" autoComplete="current-password" required value={wachtwoord} onChange={(e) => setWachtwoord(e.target.value)} />
      </div>
      {fout && <p className="foutmelding" role="alert" style={{ margin: 0 }}>{fout}</p>}
      <button type="submit" className="knop primair" disabled={bezig} style={{ minHeight: 48 }}>
        {bezig ? 'Bezig…' : 'Inloggen'}
      </button>
    </form>
  );
}
