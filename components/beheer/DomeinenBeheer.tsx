'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { maakBrowserClient } from '@/lib/supabase/client';
import type { Domein } from '@/lib/types';

interface Props {
  domeinen: Domein[];
  aantallen: Record<string, number>;
}

export default function DomeinenBeheer({ domeinen, aantallen }: Props) {
  const router = useRouter();
  const [bewerkId, setBewerkId] = useState<string | null>(null);
  const [conceptNaam, setConceptNaam] = useState('');
  const [conceptOmschrijving, setConceptOmschrijving] = useState('');
  const [nieuwNaam, setNieuwNaam] = useState('');
  const [nieuwOmschrijving, setNieuwOmschrijving] = useState('');
  const [melding, setMelding] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  const gesorteerd = [...domeinen].sort((a, b) => a.volgorde - b.volgorde);

  async function uitvoeren(actie: () => Promise<{ error: { message: string; code?: string } | null }>, foutTekst?: (code?: string) => string | null) {
    setBezig(true);
    setMelding(null);
    const { error } = await actie();
    setBezig(false);
    if (error) {
      setMelding(foutTekst?.(error.code) ?? `Er ging iets mis: ${error.message}`);
      return false;
    }
    router.refresh();
    return true;
  }

  async function verplaats(index: number, richting: -1 | 1) {
    const ander = gesorteerd[index + richting];
    const deze = gesorteerd[index];
    if (!ander) return;
    const supabase = maakBrowserClient();
    // Volgorde opnieuw nummeren zodat dubbele waarden geen probleem geven
    const nieuw = [...gesorteerd];
    nieuw[index] = ander;
    nieuw[index + richting] = deze;
    await uitvoeren(async () => {
      for (let i = 0; i < nieuw.length; i++) {
        const { error } = await supabase.from('domeinen').update({ volgorde: i + 1 }).eq('id', nieuw[i].id);
        if (error) return { error };
      }
      return { error: null };
    });
  }

  async function opslaan(d: Domein) {
    if (!conceptNaam.trim()) return;
    const supabase = maakBrowserClient();
    const gelukt = await uitvoeren(
      async () =>
        supabase.from('domeinen').update({ naam: conceptNaam.trim(), omschrijving: conceptOmschrijving.trim() || null }).eq('id', d.id),
      (code) => (code === '23505' ? 'Er bestaat al een domein met deze naam.' : null)
    );
    if (gelukt) setBewerkId(null);
  }

  async function verwijder(d: Domein) {
    if ((aantallen[d.id] ?? 0) > 0) {
      setMelding(`“${d.naam}” bevat nog ${aantallen[d.id]} normen. Verplaats die eerst naar een ander domein.`);
      return;
    }
    if (!window.confirm(`Domein “${d.naam}” verwijderen?`)) return;
    const supabase = maakBrowserClient();
    await uitvoeren(
      async () => supabase.from('domeinen').delete().eq('id', d.id),
      (code) => (code === '23503' ? `“${d.naam}” is nog gekoppeld aan normen.` : null)
    );
  }

  async function toevoegen(e: React.FormEvent) {
    e.preventDefault();
    if (!nieuwNaam.trim()) return;
    const supabase = maakBrowserClient();
    const volgorde = gesorteerd.length > 0 ? Math.max(...gesorteerd.map((d) => d.volgorde)) + 1 : 1;
    const gelukt = await uitvoeren(
      async () => supabase.from('domeinen').insert({ naam: nieuwNaam.trim(), omschrijving: nieuwOmschrijving.trim() || null, volgorde }),
      (code) => (code === '23505' ? 'Er bestaat al een domein met deze naam.' : null)
    );
    if (gelukt) {
      setNieuwNaam('');
      setNieuwOmschrijving('');
    }
  }

  return (
    <div className="sectie" style={{ maxWidth: 1000, paddingTop: 32, paddingBottom: 48 }}>
      <h1 style={{ margin: 0, fontSize: 26 }}>Domeinen</h1>
      <p style={{ margin: '6px 0 0', color: 'var(--tekst-2)' }}>
        Domeinen zijn de takken van de netwerkkaart. Alleen domeinen met minimaal één norm worden getoond. De volgorde hieronder bepaalt de volgorde rond ISO 3166, met de klok mee vanaf rechts.
      </p>

      {melding && <p className="foutmelding" role="status" style={{ marginTop: 20 }}>{melding}</p>}

      <ol className="items" style={{ marginTop: 24 }}>
        {gesorteerd.map((d, i) => (
          <li key={d.id} className="item" style={{ padding: '16px 18px', borderRadius: 10 }}>
            {bewerkId === d.id ? (
              <div className="relatie-rij">
                <div className="veld">
                  <label htmlFor={`naam-${d.id}`}>Naam</label>
                  <input id={`naam-${d.id}`} type="text" value={conceptNaam} onChange={(e) => setConceptNaam(e.target.value)} />
                </div>
                <div className="veld" style={{ flex: '2 1 320px' }}>
                  <label htmlFor={`oms-${d.id}`}>Omschrijving</label>
                  <input id={`oms-${d.id}`} type="text" value={conceptOmschrijving} onChange={(e) => setConceptOmschrijving(e.target.value)} />
                </div>
                <button type="button" className="knop primair" disabled={bezig} onClick={() => opslaan(d)}>Opslaan</button>
                <button type="button" className="knop" onClick={() => setBewerkId(null)}>Annuleren</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 13, color: 'var(--tekst-3)', width: 24 }}>{i + 1}</span>
                <div style={{ flex: '1 1 320px', minWidth: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 600 }}>{d.naam}</div>
                  <div style={{ fontSize: 14, color: 'var(--tekst-3)' }}>{d.omschrijving || '—'}</div>
                </div>
                <span className="label nowrap">{aantallen[d.id] ?? 0} normen</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button type="button" className="knop" style={{ width: 44, padding: 0 }} disabled={bezig || i === 0} onClick={() => verplaats(i, -1)} aria-label={`${d.naam} omhoog`}>↑</button>
                  <button type="button" className="knop" style={{ width: 44, padding: 0 }} disabled={bezig || i === gesorteerd.length - 1} onClick={() => verplaats(i, 1)} aria-label={`${d.naam} omlaag`}>↓</button>
                  <button
                    type="button"
                    className="knop klein"
                    style={{ minHeight: 44 }}
                    onClick={() => {
                      setBewerkId(d.id);
                      setConceptNaam(d.naam);
                      setConceptOmschrijving(d.omschrijving ?? '');
                    }}
                  >
                    Wijzigen
                  </button>
                  <button type="button" className="knop klein gevaar" style={{ minHeight: 44 }} disabled={bezig} onClick={() => verwijder(d)}>Verwijderen</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ol>

      <form onSubmit={toevoegen} className="kaart" style={{ marginTop: 28, padding: 20 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>Domein toevoegen</h2>
        <div className="relatie-rij">
          <div className="veld">
            <label htmlFor="nieuwnaam">Naam</label>
            <input id="nieuwnaam" type="text" value={nieuwNaam} onChange={(e) => setNieuwNaam(e.target.value)} placeholder="bijv. Gezondheid" />
          </div>
          <div className="veld" style={{ flex: '2 1 320px' }}>
            <label htmlFor="nieuwomschr">Omschrijving</label>
            <input id="nieuwomschr" type="text" value={nieuwOmschrijving} onChange={(e) => setNieuwOmschrijving(e.target.value)} placeholder="Korte uitleg voor bezoekers" />
          </div>
          <button type="submit" className="knop primair" disabled={bezig}>Toevoegen</button>
        </div>
      </form>
    </div>
  );
}
