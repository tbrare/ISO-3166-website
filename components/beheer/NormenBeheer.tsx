'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { maakBrowserClient } from '@/lib/supabase/client';
import {
  FORMELE_TYPES,
  ISO3166_DELEN,
  NIVEAU_LABEL,
  NIVEAUS,
  NORM_TYPES,
  RELATIE_LABEL,
  RELATIE_TYPES,
  STATUS_LABEL,
  STATUSSEN,
} from '@/lib/labels';
import { volledigeTitel, type Domein, type Iso3166Verwijzing, type Niveau, type Norm, type NormType, type Relatie, type RelatieType, type Status } from '@/lib/types';

interface RelatieInvoer {
  naar_norm_id: string;
  type: RelatieType;
  status: Status;
}

interface VerwijzingInvoer {
  paragraaf_nummer: string;
  paragraaf_titel: string;
  toelichting: string;
}

interface Formulier {
  code: string;
  titel: string;
  specificatie: string;
  afkorting: string;
  jaar: string;
  type: NormType;
  niveau: Niveau;
  iso3166_editie: string;
  organisaties: string;
  hoofddomein_id: string;
  extra_domein_ids: string[];
  toepassing: string;
  beleidsrelevantie: string;
  gebruikt_iso3166: boolean;
  iso3166_delen: string[];
  element: string;
  afwijkingen: string;
  bron: string;
  status: Status;
  relaties: RelatieInvoer[];
  verwijzingen: VerwijzingInvoer[];
}

function leegFormulier(domeinen: Domein[]): Formulier {
  return {
    code: '',
    titel: '',
    specificatie: '',
    afkorting: '',
    jaar: '',
    type: 'NEN',
    niveau: 'nationaal',
    iso3166_editie: '',
    organisaties: '',
    hoofddomein_id: domeinen[0]?.id ?? '',
    extra_domein_ids: [],
    toepassing: '',
    beleidsrelevantie: '',
    gebruikt_iso3166: true,
    iso3166_delen: [],
    element: '',
    afwijkingen: '',
    bron: '',
    status: 'concept',
    relaties: [],
    verwijzingen: [],
  };
}

function vanNorm(n: Norm, relaties: Relatie[]): Formulier {
  return {
    code: n.code,
    titel: n.titel,
    specificatie: n.specificatie ?? '',
    afkorting: n.afkorting ?? '',
    jaar: n.jaar ? String(n.jaar) : '',
    type: n.type,
    niveau: n.niveau,
    iso3166_editie: n.iso3166_editie ?? '',
    organisaties: n.organisaties.join(', '),
    hoofddomein_id: n.hoofddomein_id ?? '',
    extra_domein_ids: n.extra_domein_ids,
    toepassing: n.toepassing,
    beleidsrelevantie: n.beleidsrelevantie ?? '',
    gebruikt_iso3166: n.gebruikt_iso3166,
    iso3166_delen: n.iso3166_delen,
    element: n.element ?? '',
    afwijkingen: n.afwijkingen ?? '',
    bron: n.bron ?? '',
    status: n.status,
    relaties: relaties
      .filter((r) => r.van_norm_id === n.id)
      .map((r) => ({ naar_norm_id: r.naar_norm_id, type: r.type, status: r.status })),
    verwijzingen: n.verwijzingen.map((v: Iso3166Verwijzing) => ({
      paragraaf_nummer: v.paragraaf_nummer,
      paragraaf_titel: v.paragraaf_titel ?? '',
      toelichting: v.toelichting ?? '',
    })),
  };
}

const leegNaarNull = (s: string) => (s.trim() === '' ? null : s.trim());

interface Props {
  domeinen: Domein[];
  normen: Norm[];
  relaties: Relatie[];
}

export default function NormenBeheer({ domeinen, normen, relaties }: Props) {
  const router = useRouter();
  const [bewerkId, setBewerkId] = useState<string | null>(null);
  const [f, setF] = useState<Formulier>(() => leegFormulier(domeinen));
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [zoek, setZoek] = useState('');

  const zet = <K extends keyof Formulier>(k: K, v: Formulier[K]) => setF((oud) => ({ ...oud, [k]: v }));
  const wissel = (lijst: string[], waarde: string) =>
    lijst.includes(waarde) ? lijst.filter((x) => x !== waarde) : [...lijst, waarde];

  function nieuw() {
    setBewerkId(null);
    setF(leegFormulier(domeinen));
    setFout(null);
    setOk(null);
  }

  function bewerk(n: Norm) {
    setBewerkId(n.id);
    setF(vanNorm(n, relaties));
    setFout(null);
    setOk(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function opslaan(e: React.FormEvent) {
    e.preventDefault();
    setFout(null);
    setOk(null);
    if (!f.code.trim() || !f.titel.trim() || !f.toepassing.trim()) {
      setFout('Vul minimaal normcode, titel en toepassing in.');
      return;
    }
    if (f.jaar.trim() && !/^(19|20)\d{2}$/.test(f.jaar.trim())) {
      setFout('Vul het jaartal in als vier cijfers, bijvoorbeeld 2022.');
      return;
    }
    const ingevuldeVerwijzingen = f.verwijzingen.filter(
      (v) => v.paragraaf_nummer.trim() || v.paragraaf_titel.trim() || v.toelichting.trim()
    );
    if (ingevuldeVerwijzingen.some((v) => !v.paragraaf_nummer.trim())) {
      setFout('Vul bij elke verwijzing naar ISO 3166 een paragraafnummer in.');
      return;
    }
    if (!f.gebruikt_iso3166 && f.status === 'bevestigd' && !f.relaties.some((r) => r.naar_norm_id)) {
      setFout('Deze norm gebruikt ISO 3166 niet direct. Leg bij blok 4 minimaal één relatie vast met de norm via welke ISO 3166 wordt gebruikt, voordat je hem bevestigt.');
      return;
    }
    if (/:\d{4}\s*$/.test(f.code.trim())) {
      setFout('Laat het jaartal weg uit de normcode (bijv. ISO 9362) en vul het in bij Jaartal.');
      return;
    }
    setBezig(true);
    const supabase = maakBrowserClient();
    const gegevens = {
      code: f.code.trim(),
      titel: f.titel.trim(),
      specificatie: leegNaarNull(f.specificatie),
      afkorting: leegNaarNull(f.afkorting),
      jaar: f.jaar.trim() ? Number(f.jaar.trim()) : null,
      type: f.type,
      niveau: f.niveau,
      iso3166_editie: leegNaarNull(f.iso3166_editie),
      organisaties: f.organisaties.split(',').map((o) => o.trim()).filter(Boolean),
      hoofddomein_id: f.hoofddomein_id || null,
      toepassing: f.toepassing.trim(),
      beleidsrelevantie: leegNaarNull(f.beleidsrelevantie),
      gebruikt_iso3166: f.gebruikt_iso3166,
      iso3166_delen: f.iso3166_delen,
      element: leegNaarNull(f.element),
      afwijkingen: leegNaarNull(f.afwijkingen),
      bron: leegNaarNull(f.bron),
      status: f.status,
    };

    try {
      let id = bewerkId;
      if (id) {
        const { error } = await supabase.from('normen').update(gegevens).eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('normen').insert(gegevens).select('id').single();
        if (error) throw error;
        id = (data as { id: string }).id;
      }

      // Aanvullende domeinen vervangen
      const r1 = await supabase.from('norm_domeinen').delete().eq('norm_id', id);
      if (r1.error) throw r1.error;
      const extra = f.extra_domein_ids.filter((d) => d !== f.hoofddomein_id);
      if (extra.length > 0) {
        const r2 = await supabase.from('norm_domeinen').insert(extra.map((domein_id) => ({ norm_id: id, domein_id })));
        if (r2.error) throw r2.error;
      }

      // Uitgaande relaties vervangen (dubbele en lege regels overslaan)
      const r3 = await supabase.from('relaties').delete().eq('van_norm_id', id);
      if (r3.error) throw r3.error;
      const gezien = new Set<string>();
      const nieuweRelaties = f.relaties
        .filter((r) => r.naar_norm_id && r.naar_norm_id !== id)
        .filter((r) => {
          const sleutel = `${r.naar_norm_id}|${r.type}`;
          if (gezien.has(sleutel)) return false;
          gezien.add(sleutel);
          return true;
        })
        .map((r) => ({ van_norm_id: id, naar_norm_id: r.naar_norm_id, type: r.type, status: r.status }));
      if (nieuweRelaties.length > 0) {
        const r4 = await supabase.from('relaties').insert(nieuweRelaties);
        if (r4.error) throw r4.error;
      }

      // Verwijzingen naar ISO 3166 vervangen
      const r5 = await supabase.from('iso3166_verwijzingen').delete().eq('norm_id', id);
      if (r5.error) throw r5.error;
      if (ingevuldeVerwijzingen.length > 0) {
        const r6 = await supabase.from('iso3166_verwijzingen').insert(
          ingevuldeVerwijzingen.map((v, i) => ({
            norm_id: id,
            paragraaf_nummer: v.paragraaf_nummer.trim(),
            paragraaf_titel: leegNaarNull(v.paragraaf_titel),
            toelichting: leegNaarNull(v.toelichting),
            volgorde: i + 1,
          }))
        );
        if (r6.error) throw r6.error;
      }

      setOk(`${gegevens.code} is opgeslagen.`);
      setBewerkId(id);
      router.refresh();
    } catch (err) {
      const bericht = err instanceof Error ? err.message : (err as { message?: string })?.message ?? 'Onbekende fout';
      setFout(bericht.includes('duplicate key') ? 'Er bestaat al een norm met deze code.' : `Opslaan mislukt: ${bericht}`);
    } finally {
      setBezig(false);
    }
  }

  async function verwijder(n: Norm) {
    if (!window.confirm(`Weet je zeker dat je ${n.code} wilt verwijderen? Relaties met deze norm verdwijnen ook.`)) return;
    const supabase = maakBrowserClient();
    const { error } = await supabase.from('normen').delete().eq('id', n.id);
    if (error) {
      setFout(`Verwijderen mislukt: ${error.message}`);
      return;
    }
    if (bewerkId === n.id) nieuw();
    setOk(`${n.code} is verwijderd.`);
    router.refresh();
  }

  const andereNormen = normen.filter((n) => n.id !== bewerkId);
  const lijst = normen.filter((n) =>
    [n.code, n.titel, n.specificatie ?? '', n.afkorting ?? '', ...n.organisaties].join(' ').toLowerCase().includes(zoek.trim().toLowerCase())
  );

  return (
    <div className="sectie beheer-rij" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <main className="kaart beheer-hoofd">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 26 }}>{bewerkId ? `${f.code || 'Norm'} bewerken` : 'Norm toevoegen'}</h1>
          {bewerkId && <button type="button" className="knop klein" onClick={nieuw}>+ Nieuwe norm</button>}
        </div>
        <p style={{ margin: '6px 0 0', color: 'var(--tekst-2)' }}>Leg vast welke norm of codelijst ISO 3166 gebruikt, door wie en waarvoor.</p>

        <form onSubmit={opslaan}>
          <h2 className="blok-titel">1 · De norm</h2>
          <div className="raster">
            <div className="veld">
              <label htmlFor="code">Normcode *</label>
              <input id="code" type="text" className="mono" value={f.code} onChange={(e) => zet('code', e.target.value)} placeholder="bijv. ISO 9362 (zonder jaartal)" />
            </div>
            <div className="veld">
              <label htmlFor="type">Type</label>
              <select id="type" value={f.type} onChange={(e) => zet('type', e.target.value as NormType)}>
                {NORM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <span className="hulp">Wordt getoond als: <b>{FORMELE_TYPES.includes(f.type) ? 'formele norm (rond)' : 'informeel (vierkant)'}</b></span>
            </div>
            <div className="veld breed">
              <label htmlFor="titel">Titel *</label>
              <input id="titel" type="text" value={f.titel} onChange={(e) => zet('titel', e.target.value)} placeholder="bijv. Banking — Banking telecommunication messages" />
            </div>
            <div className="veld breed">
              <label htmlFor="specificatie">Specificatie op titel</label>
              <input id="specificatie" type="text" value={f.specificatie} onChange={(e) => zet('specificatie', e.target.value)} placeholder="bijv. Business identifier code (BIC)" />
              <span className="hulp">Op de site getoond als: <b>{volledigeTitel(f) || '—'}</b></span>
            </div>
            <div className="veld">
              <label htmlFor="afkorting">Afkorting</label>
              <input id="afkorting" type="text" value={f.afkorting} onChange={(e) => zet('afkorting', e.target.value)} placeholder="bijv. BIC" />
            </div>
            <div className="veld">
              <label htmlFor="jaar">Jaartal (editie)</label>
              <input id="jaar" type="text" inputMode="numeric" maxLength={4} value={f.jaar} onChange={(e) => zet('jaar', e.target.value)} placeholder="bijv. 2022" />
              <span className="hulp">Wordt getoond als <span className="mono">{f.code.trim() || 'code'}{f.jaar.trim() ? `:${f.jaar.trim()}` : ''}</span></span>
            </div>
            <div className="veld">
              <label htmlFor="niveau">Niveau</label>
              <select id="niveau" value={f.niveau} onChange={(e) => zet('niveau', e.target.value as Niveau)}>
                {NIVEAUS.map((n) => <option key={n} value={n}>{NIVEAU_LABEL[n]}</option>)}
              </select>
            </div>
            <div className="veld">
              <label htmlFor="editie">Verwijst naar ISO 3166-editie</label>
              <input id="editie" type="text" value={f.iso3166_editie} onChange={(e) => zet('iso3166_editie', e.target.value)} placeholder="bijv. ISO 3166-1:2020 of ongedateerd" />
            </div>
          </div>

          <h2 className="blok-titel">2 · Gebruik en toepassing</h2>
          <div className="raster">
            <div className="veld">
              <label htmlFor="org">Organisaties</label>
              <input id="org" type="text" value={f.organisaties} onChange={(e) => zet('organisaties', e.target.value)} placeholder="Komma-gescheiden, bijv. Kadaster, KvK" />
            </div>
            <div className="veld">
              <label htmlFor="domein">Hoofddomein</label>
              <select id="domein" value={f.hoofddomein_id} onChange={(e) => zet('hoofddomein_id', e.target.value)}>
                <option value="">— geen —</option>
                {domeinen.map((d) => <option key={d.id} value={d.id}>{d.naam}</option>)}
              </select>
              <a href="/beheer/domeinen" style={{ fontSize: 13 }}>Domeinen beheren</a>
            </div>
            <fieldset className="breed">
              <legend>Aanvullende domeinen (optioneel)</legend>
              <div className="vinkjes">
                {domeinen.filter((d) => d.id !== f.hoofddomein_id).map((d) => (
                  <label key={d.id}>
                    <input type="checkbox" checked={f.extra_domein_ids.includes(d.id)} onChange={() => zet('extra_domein_ids', wissel(f.extra_domein_ids, d.id))} />
                    {d.naam}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="veld breed">
              <label htmlFor="toep">Toepassing *</label>
              <textarea id="toep" rows={3} value={f.toepassing} onChange={(e) => zet('toepassing', e.target.value)} placeholder="bijv. Algemene persoonsgegevens: nationaliteit en geboorteland" />
            </div>
            <div className="veld breed">
              <label htmlFor="beleid">Waarom relevant voor beleid</label>
              <textarea id="beleid" rows={2} value={f.beleidsrelevantie} onChange={(e) => zet('beleidsrelevantie', e.target.value)} placeholder="In één of twee zinnen, in begrijpelijke taal voor beleidsmakers" />
            </div>
          </div>

          <h2 className="blok-titel">3 · Hoe ISO 3166 wordt gebruikt</h2>
          <div className="vinkjes" style={{ marginBottom: 8 }}>
            <label>
              <input type="checkbox" checked={f.gebruikt_iso3166} onChange={() => zet('gebruikt_iso3166', !f.gebruikt_iso3166)} />
              <span><b>Deze norm verwijst direct naar ISO 3166</b></span>
            </label>
          </div>
          {!f.gebruikt_iso3166 && (
            <p className="foutmelding" style={{ margin: '0 0 8px', background: '#EDE9FE', color: '#4C1D95' }}>
              Indirect gebruik: de norm verwijst zelf niet naar ISO 3166, maar het is te verwachten dat er een koppeling is via een
              andere norm. Leg die norm vast bij blok 4 hieronder; in het web komt deze norm in het verlengde daarvan te liggen.
            </p>
          )}
          {f.gebruikt_iso3166 && (
            <>
            <fieldset>
              <legend>Gebruikt deel en codeformaat</legend>
              <div className="vinkjes">
                {ISO3166_DELEN.map((d) => (
                  <label key={d}>
                    <input type="checkbox" checked={f.iso3166_delen.includes(d)} onChange={() => zet('iso3166_delen', wissel(f.iso3166_delen, d))} />
                    <span className="mono">{d}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="raster" style={{ marginTop: 16 }}>
              <div className="veld">
                <label htmlFor="elem">Waar in de norm</label>
                <input id="elem" type="text" value={f.element} onChange={(e) => zet('element', e.target.value)} placeholder="bijv. element 'nationaliteit', positie 5–6" />
              </div>
              <div className="veld">
                <label htmlFor="afw">Afwijkingen van ISO 3166</label>
                <input id="afw" type="text" value={f.afwijkingen} onChange={(e) => zet('afwijkingen', e.target.value)} placeholder="bijv. EL i.p.v. GR, eigen codes" />
              </div>
            </div>

            <fieldset style={{ marginTop: 16 }}>
              <legend>Verwijzingen naar ISO 3166 in de normtekst</legend>
              <p style={{ margin: '0 0 12px', fontSize: 14, color: 'var(--tekst-3)' }}>
                Eén regel per paragraaf waarin de norm naar ISO 3166 verwijst.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {f.verwijzingen.map((v, i) => {
                  const wijzig = (deel: Partial<VerwijzingInvoer>) =>
                    zet('verwijzingen', f.verwijzingen.map((x, j) => (j === i ? { ...x, ...deel } : x)));
                  return (
                    <div key={i} style={{ borderLeft: '3px solid var(--rand)', paddingLeft: 12 }}>
                      <div className="relatie-rij">
                        <div className="veld" style={{ flex: '0 1 140px' }}>
                          <label htmlFor={`pn-${i}`}>Paragraaf nr. *</label>
                          <input id={`pn-${i}`} type="text" className="mono" value={v.paragraaf_nummer} onChange={(e) => wijzig({ paragraaf_nummer: e.target.value })} placeholder="bijv. 5.2" />
                        </div>
                        <div className="veld" style={{ flex: '1 1 260px' }}>
                          <label htmlFor={`pt-${i}`}>Paragraaftitel</label>
                          <input id={`pt-${i}`} type="text" value={v.paragraaf_titel} onChange={(e) => wijzig({ paragraaf_titel: e.target.value })} placeholder="bijv. Structure of the BIC" />
                        </div>
                        <button type="button" className="knop" onClick={() => zet('verwijzingen', f.verwijzingen.filter((_, j) => j !== i))}>
                          Verwijderen<span className="verborgen"> verwijzing {v.paragraaf_nummer}</span>
                        </button>
                      </div>
                      <div className="veld" style={{ marginTop: 10 }}>
                        <label htmlFor={`pl-${i}`}>Toelichting</label>
                        <textarea id={`pl-${i}`} rows={2} value={v.toelichting} onChange={(e) => wijzig({ toelichting: e.target.value })} placeholder="bijv. Positie 5–6 bevat de landcode volgens ISO 3166-1 alpha-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                className="knop paars"
                style={{ marginTop: 12 }}
                onClick={() => zet('verwijzingen', [...f.verwijzingen, { paragraaf_nummer: '', paragraaf_titel: '', toelichting: '' }])}
              >
                + Verwijzing toevoegen
              </button>
            </fieldset>
            </>
          )}

          <h2 className="blok-titel">4 · Directe relaties met andere normen</h2>
          <p style={{ margin: '0 0 12px', fontSize: 14, color: 'var(--tekst-3)' }}>Alleen als deze norm in de tekst rechtstreeks naar een andere norm verwijst.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {f.relaties.map((r, i) => {
              const wijzig = (deel: Partial<RelatieInvoer>) =>
                zet('relaties', f.relaties.map((x, j) => (j === i ? { ...x, ...deel } : x)));
              return (
                <div key={i} className="relatie-rij">
                  <div className="veld">
                    <label htmlFor={`rt-${i}`}>Relatie</label>
                    <select id={`rt-${i}`} value={r.type} onChange={(e) => wijzig({ type: e.target.value as RelatieType })}>
                      {RELATIE_TYPES.map((t) => <option key={t} value={t}>{RELATIE_LABEL[t]}</option>)}
                    </select>
                  </div>
                  <div className="veld">
                    <label htmlFor={`rn-${i}`}>Andere norm</label>
                    <select id={`rn-${i}`} value={r.naar_norm_id} onChange={(e) => wijzig({ naar_norm_id: e.target.value })}>
                      <option value="">— kies —</option>
                      {andereNormen.map((n) => <option key={n.id} value={n.id}>{n.code}</option>)}
                    </select>
                  </div>
                  <div className="veld">
                    <label htmlFor={`rs-${i}`}>Status</label>
                    <select id={`rs-${i}`} value={r.status} onChange={(e) => wijzig({ status: e.target.value as Status })}>
                      {STATUSSEN.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </div>
                  <button type="button" className="knop" onClick={() => zet('relaties', f.relaties.filter((_, j) => j !== i))}>Verwijderen</button>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            className="knop paars"
            style={{ marginTop: 12 }}
            onClick={() => zet('relaties', [...f.relaties, { naar_norm_id: '', type: 'verwijst_naar', status: 'te_verifieren' }])}
          >
            + Relatie toevoegen
          </button>

          <h2 className="blok-titel">5 · Bron en status</h2>
          <div className="raster">
            <div className="veld">
              <label htmlFor="bron">Bron (URL of documentverwijzing)</label>
              <input id="bron" type="text" value={f.bron} onChange={(e) => zet('bron', e.target.value)} placeholder="https://… of NEN-catalogus" />
            </div>
            <div className="veld">
              <label htmlFor="status">Status</label>
              <select id="status" value={f.status} onChange={(e) => zet('status', e.target.value as Status)}>
                {STATUSSEN.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
              <span className="hulp">Alleen bevestigde normen verschijnen op de publieke site.</span>
            </div>
          </div>

          {fout && <p className="foutmelding" role="alert" style={{ marginTop: 20 }}>{fout}</p>}
          {ok && <p className="okmelding" role="status" style={{ marginTop: 20 }}>{ok}</p>}
          <div className="knoppen">
            <button type="submit" className="knop primair" disabled={bezig}>{bezig ? 'Bezig met opslaan…' : 'Opslaan'}</button>
            <button type="button" className="knop" onClick={nieuw}>Leegmaken</button>
          </div>
        </form>
      </main>

      <aside className="kaart beheer-zij">
        <h2 style={{ margin: 0, fontSize: 18 }}>Alle normen</h2>
        <p style={{ margin: '4px 0 12px', fontSize: 14, color: 'var(--tekst-3)' }}>{normen.length} items</p>
        <div className="veld" style={{ marginBottom: 12 }}>
          <label htmlFor="zoeklijst" className="verborgen">Zoek in normen</label>
          <input id="zoeklijst" type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoeken…" />
        </div>
        <ul className="items">
          {lijst.map((n) => (
            <li key={n.id} className={`item${n.id === bewerkId ? ' geselecteerd' : ''}`}>
              <div className="item-kop">
                <span className="mono" style={{ fontWeight: 500 }}>{n.code}{n.jaar ? `:${n.jaar}` : ''}</span>
                <span className={`label ${n.status}`}>{STATUS_LABEL[n.status]}</span>
              </div>
              <div style={{ fontSize: 14, marginTop: 4 }}>{volledigeTitel(n)}</div>
              <div style={{ fontSize: 13, color: 'var(--tekst-3)', marginTop: 4 }}>
                {(n.organisaties.join(', ') || '—') + ' · ' + NIVEAU_LABEL[n.niveau]}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="button" className="knop klein" onClick={() => bewerk(n)}>Bewerken<span className="verborgen"> {n.code}</span></button>
                <button type="button" className="knop klein gevaar" onClick={() => verwijder(n)}>Verwijderen<span className="verborgen"> {n.code}</span></button>
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
