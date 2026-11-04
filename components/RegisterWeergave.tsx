'use client';

import { useMemo, useState } from 'react';
import Spinnenweb from './Spinnenweb';
import { NIVEAU_KLEUR, NIVEAU_LABEL, RELATIE_LABEL, RELATIE_LABEL_OMGEKEERD } from '@/lib/labels';
import { volledigeTitel, type Domein, type Niveau, type Norm, type Relatie } from '@/lib/types';

type NiveauFilter = 'alle' | Niveau;
type SoortFilter = 'alle' | 'formeel' | 'informeel';

interface Props {
  domeinen: Domein[];
  normen: Norm[];
  relaties: Relatie[];
}

export default function RegisterWeergave({ domeinen, normen, relaties }: Props) {
  const [geselecteerd, setGeselecteerd] = useState<string | null>(normen[0]?.id ?? null);
  const [niveau, setNiveau] = useState<NiveauFilter>('alle');
  const [soort, setSoort] = useState<SoortFilter>('alle');
  const [toonRelaties, setToonRelaties] = useState(true);
  const [actiefDomein, setActiefDomein] = useState<string | null>(null);
  const [zoek, setZoek] = useState('');

  const domeinNaam = useMemo(() => Object.fromEntries(domeinen.map((d) => [d.id, d.naam])), [domeinen]);
  const perId = useMemo(() => Object.fromEntries(normen.map((n) => [n.id, n])), [normen]);

  const zichtbaar = (n: Norm) =>
    (niveau === 'alle' || n.niveau === niveau) && (soort === 'alle' || (soort === 'formeel') === n.formeel);

  const inDomein = (n: Norm) =>
    actiefDomein === null || n.hoofddomein_id === actiefDomein || n.extra_domein_ids.includes(actiefDomein);

  const domeinenVan = (n: Norm) =>
    [n.hoofddomein_id, ...n.extra_domein_ids]
      .filter((id): id is string => !!id && !!domeinNaam[id])
      .map((id) => domeinNaam[id])
      .join(', ') || '—';

  const rijen = normen.filter((n) => {
    if (!zichtbaar(n) || !inDomein(n)) return false;
    if (!zoek.trim()) return true;
    const hooi = [n.code, n.titel, n.specificatie ?? '', n.afkorting ?? '', n.jaar ?? '', n.toepassing, ...n.organisaties].join(' ').toLowerCase();
    return hooi.includes(zoek.trim().toLowerCase());
  });

  const organisaties = new Set(normen.flatMap((n) => n.organisaties.map((o) => o.trim()).filter(Boolean)));
  const huidig = geselecteerd ? perId[geselecteerd] : undefined;
  const huidigeRelaties = huidig
    ? relaties
        .filter((r) => r.van_norm_id === huidig.id || r.naar_norm_id === huidig.id)
        .map((r) => {
          const uit = r.van_norm_id === huidig.id;
          const ander = perId[uit ? r.naar_norm_id : r.van_norm_id];
          return { r, uit, ander };
        })
        .filter((x) => !!x.ander)
    : [];

  const kies = (id: string) => setGeselecteerd(id);

  return (
    <>
      <section className="sectie intro" style={{ paddingTop: 48 }}>
        <p className="bovenregel">ISO 3166 · landencodes in de praktijk</p>
        <h1>Waar wordt ISO 3166 gebruikt?</h1>
        <p className="lead">
          Landencodes lijken een detail, maar betalingsverkeer, reisdocumenten, e-facturatie en basisregistraties zijn ervan
          afhankelijk. Dit register laat zien welke normen en codelijsten ISO 3166 gebruiken, welke organisaties ermee werken
          en hoe die normen naar elkaar verwijzen.
        </p>
        <div className="cijfers">
          <div className="cijfer"><b>{normen.length}</b><span>normen en codelijsten</span></div>
          <div className="cijfer"><b>{organisaties.size}</b><span>organisaties</span></div>
          <div className="cijfer"><b>{relaties.length}</b><span>directe relaties tussen normen</span></div>
          <div className="cijfer"><b>{domeinen.length}</b><span>toepassingsdomeinen</span></div>
        </div>
      </section>

      <section id="web" className="sectie web-rij">
        <div className="kaart web-kaart">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 22 }}>Spinnenweb</h2>
            <button type="button" className="chip paars" aria-pressed={toonRelaties} onClick={() => setToonRelaties(!toonRelaties)}>
              Relaties tussen normen
            </button>
          </div>
          <div className="filters">
            <div className="chipgroep" role="group" aria-label="Filter op niveau">
              {(['alle', 'internationaal', 'europees', 'nationaal'] as NiveauFilter[]).map((k) => (
                <button key={k} type="button" className="chip" aria-pressed={niveau === k} onClick={() => setNiveau(k)}>
                  {k === 'alle' ? 'Alle niveaus' : NIVEAU_LABEL[k]}
                </button>
              ))}
            </div>
            <div className="chipgroep" role="group" aria-label="Filter op soort">
              {([['alle', 'Alle soorten'], ['formeel', 'Formele normen'], ['informeel', 'Informeel']] as [SoortFilter, string][]).map(([k, l]) => (
                <button key={k} type="button" className="chip" aria-pressed={soort === k} onClick={() => setSoort(k)}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--tekst-3)' }}>
            Vanuit ISO 3166 vertakt het web naar de toepassingsdomeinen, en vanuit elk domein naar de normen die er gebruik van maken. Klik
            op een domein om alleen die waaier te tonen, of op een norm voor details. Paarse pijlen zijn directe verwijzingen tussen normen.
          </p>
          <Spinnenweb
            domeinen={domeinen}
            normen={normen}
            relaties={relaties}
            geselecteerd={geselecteerd}
            actiefDomein={actiefDomein}
            onKiesDomein={setActiefDomein}
            zichtbaar={zichtbaar}
            toonRelaties={toonRelaties}
            onKies={kies}
          />
          {actiefDomein && (
            <p style={{ margin: '8px 0 0', fontSize: 14 }}>
              Alleen domein <b>{domeinNaam[actiefDomein]}</b>.{' '}
              <button type="button" className="knop klein" onClick={() => setActiefDomein(null)}>Toon alle domeinen</button>
            </p>
          )}
          <div className="legenda">
            <span><i style={{ background: NIVEAU_KLEUR.internationaal }} />Internationaal</span>
            <span><i style={{ background: NIVEAU_KLEUR.europees }} />Europees</span>
            <span><i style={{ background: NIVEAU_KLEUR.nationaal }} />Nationaal</span>
            <span><i style={{ border: '3px solid #4B5563' }} />Formele norm</span>
            <span><i style={{ border: '3px solid #4B5563', borderRadius: 3 }} />Informeel (codelijst, standaard)</span>
            <span><i style={{ width: 22, height: 0, borderRadius: 0, borderTop: '2px solid #6D28D9' }} />Directe relatie</span>
            <span><i style={{ width: 22, height: 0, borderRadius: 0, borderTop: '2px dashed #8A94A3' }} />Ook in ander domein</span>
          </div>
        </div>

        <aside id="detail" className="kaart detail" aria-live="polite">
          {huidig ? (
            <>
              <div className="labels">
                <span className="label" style={{ background: NIVEAU_KLEUR[huidig.niveau], color: '#fff' }}>{NIVEAU_LABEL[huidig.niveau]}</span>
                <span className="label">{huidig.formeel ? 'Formele norm' : 'Informeel'}</span>
              </div>
              <p className="detail-code">
                {huidig.code}
                {huidig.jaar && <span style={{ color: 'var(--tekst-3)' }}>:{huidig.jaar}</span>}
              </p>
              <h3>{volledigeTitel(huidig)}</h3>
              <div className="beleid">
                <p className="klein" style={{ margin: 0 }}>Waarom relevant voor beleid</p>
                <p>{huidig.beleidsrelevantie || 'Nog niet beschreven.'}</p>
              </div>
              <dl className="kenmerken">
                {huidig.afkorting && <div><dt>Afkorting</dt><dd>{huidig.afkorting}</dd></div>}
                {huidig.jaar && <div><dt>Jaartal (editie)</dt><dd>{huidig.jaar}</dd></div>}
                <div><dt>Toepassing</dt><dd>{huidig.toepassing}</dd></div>
                <div><dt>Organisaties</dt><dd>{huidig.organisaties.join(', ') || '—'}</dd></div>
                <div><dt>Domeinen</dt><dd>{domeinenVan(huidig)}</dd></div>
                <div>
                  <dt>Directe relaties</dt>
                  <dd>
                    {huidigeRelaties.length === 0 ? (
                      <span style={{ color: 'var(--tekst-3)' }}>Geen directe relaties vastgelegd</span>
                    ) : (
                      <ul className="relaties-lijst">
                        {huidigeRelaties.map(({ r, uit, ander }) => (
                          <li key={r.id}>
                            <span style={{ color: 'var(--paars)' }}>{uit ? RELATIE_LABEL[r.type] : RELATIE_LABEL_OMGEKEERD[r.type]}</span>
                            <button type="button" className="relatie-knop" onClick={() => kies(ander.id)}>{ander.code}</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </dd>
                </div>
              </dl>
              <details className="techniek">
                <summary>Technische details</summary>
                <dl className="kenmerken">
                  <div><dt>Type</dt><dd>{huidig.type}</dd></div>
                  <div><dt>Gebruikt deel van ISO 3166</dt><dd className="mono">{huidig.iso3166_delen.join(', ') || '—'}</dd></div>
                  <div><dt>Waar in de norm</dt><dd>{huidig.element || '—'}</dd></div>
                  <div><dt>Afwijkingen van ISO 3166</dt><dd>{huidig.afwijkingen || '—'}</dd></div>
                  <div><dt>Verwijst naar editie</dt><dd>{huidig.iso3166_editie || '—'}</dd></div>
                  <div>
                    <dt>Bron</dt>
                    <dd>
                      {huidig.bron ? (
                        /^https?:\/\//.test(huidig.bron) ? <a href={huidig.bron} target="_blank" rel="noopener noreferrer">{huidig.bron}</a> : huidig.bron
                      ) : '—'}
                    </dd>
                  </div>
                </dl>
              </details>
            </>
          ) : (
            <p>Er zijn nog geen normen gepubliceerd.</p>
          )}
        </aside>
      </section>

      <section id="register" className="sectie">
        <div className="kaart">
          <div className="tabel-kop">
            <div>
              <h2>Register</h2>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--tekst-3)' }}>{rijen.length} resultaten</p>
            </div>
            <div className="veld" style={{ flex: '0 1 360px', minWidth: 0 }}>
              <label htmlFor="zoek">Zoek op code, titel, organisatie of toepassing</label>
              <input id="zoek" type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="bijv. IBAN, Kadaster, paspoort" />
            </div>
          </div>
          <div className="tabel-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Titel</th>
                  <th scope="col">Afkorting</th>
                  <th scope="col">Niveau</th>
                  <th scope="col">Soort</th>
                  <th scope="col">Domeinen</th>
                  <th scope="col">Organisaties</th>
                  <th scope="col">Toepassing</th>
                  <th scope="col"><span className="verborgen">Actie</span></th>
                </tr>
              </thead>
              <tbody>
                {rijen.map((n) => (
                  <tr key={n.id}>
                    <td className="mono nowrap" style={{ fontWeight: 500 }}>
                      {n.code}
                      {n.jaar && <span style={{ color: 'var(--tekst-3)', fontWeight: 400 }}>:{n.jaar}</span>}
                    </td>
                    <td>{volledigeTitel(n)}</td>
                    <td>{n.afkorting || '—'}</td>
                    <td className="nowrap"><span className="stip" style={{ background: NIVEAU_KLEUR[n.niveau] }} />{NIVEAU_LABEL[n.niveau]}</td>
                    <td className="nowrap">{n.formeel ? 'Formeel' : 'Informeel'}</td>
                    <td>{domeinenVan(n)}</td>
                    <td>{n.organisaties.join(', ') || '—'}</td>
                    <td>{n.toepassing}</td>
                    <td>
                      <a href="#detail" onClick={() => kies(n.id)} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, fontWeight: 600 }}>
                        Bekijk<span className="verborgen"> {n.code}</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
