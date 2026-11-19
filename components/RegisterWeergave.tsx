'use client';

import { useMemo, useState } from 'react';
import Spinnenweb from './Spinnenweb';
import { NIVEAU_KLEUR } from '@/lib/labels';
import { TEKSTEN, type Taal } from '@/lib/i18n';
import { volledigeTitel, type Domein, type Niveau, type Norm, type Relatie } from '@/lib/types';

type NiveauFilter = 'alle' | Niveau;
type SoortFilter = 'alle' | 'formeel' | 'informeel';

interface Props {
  domeinen: Domein[];
  normen: Norm[];
  relaties: Relatie[];
  taal: Taal;
}

export default function RegisterWeergave({ domeinen, normen, relaties, taal }: Props) {
  const t = TEKSTEN[taal];
  const [geselecteerd, setGeselecteerd] = useState<string | null>(normen[0]?.id ?? null);
  const [niveau, setNiveau] = useState<NiveauFilter>('alle');
  const [soort, setSoort] = useState<SoortFilter>('alle');
  const [actiefDomein, setActiefDomein] = useState<string | null>(null);

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
        <p className="bovenregel">{t.bovenregel}</p>
        <h1>{t.kop}</h1>
        <p className="lead">{t.intro}</p>
        <div className="cijfers">
          <div className="cijfer"><b>{normen.length}</b><span>{t.cijferNormen}</span></div>
          <div className="cijfer"><b>{organisaties.size}</b><span>{t.cijferOrganisaties}</span></div>
          <div className="cijfer"><b>{relaties.length}</b><span>{t.cijferRelaties}</span></div>
          <div className="cijfer"><b>{domeinen.filter((d) => normen.some((n) => n.hoofddomein_id === d.id)).length}</b><span>{t.cijferDomeinen}</span></div>
        </div>
      </section>

      <section id="web" className="sectie web-rij">
        <div className="kaart web-kaart">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 22 }}>{t.kaartTitel}</h2>
          </div>
          <div className="filters">
            <div className="chipgroep" role="group" aria-label={t.filterNiveau}>
              {(['alle', 'internationaal', 'europees', 'nationaal'] as NiveauFilter[]).map((k) => (
                <button key={k} type="button" className="chip" aria-pressed={niveau === k} onClick={() => setNiveau(k)}>
                  {k === 'alle' ? t.alleNiveaus : t.niveau[k]}
                </button>
              ))}
            </div>
            <div className="chipgroep" role="group" aria-label={t.filterSoort}>
              {([['alle', t.alleSoorten], ['formeel', t.formeleNormen], ['informeel', t.informeel]] as [SoortFilter, string][]).map(([k, l]) => (
                <button key={k} type="button" className="chip" aria-pressed={soort === k} onClick={() => setSoort(k)}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--tekst-3)' }}>{t.kaartUitleg}</p>
          <Spinnenweb
            domeinen={domeinen}
            normen={normen}
            relaties={relaties}
            geselecteerd={geselecteerd}
            actiefDomein={actiefDomein}
            onKiesDomein={setActiefDomein}
            zichtbaar={zichtbaar}
            onKies={kies}
            teksten={t}
          />
          {actiefDomein && (
            <p style={{ margin: '8px 0 0', fontSize: 14 }}>
              {t.alleenDomein} <b>{domeinNaam[actiefDomein]}</b>.{' '}
              <button type="button" className="knop klein" onClick={() => setActiefDomein(null)}>{t.toonAlleDomeinen}</button>
            </p>
          )}
          <div className="legenda">
            <span><i style={{ background: NIVEAU_KLEUR.internationaal }} />{t.niveau.internationaal}</span>
            <span><i style={{ background: NIVEAU_KLEUR.europees }} />{t.niveau.europees}</span>
            <span><i style={{ background: NIVEAU_KLEUR.nationaal }} />{t.niveau.nationaal}</span>
            <span><i style={{ border: '3px solid #4B5563' }} />{t.legFormeel}</span>
            <span><i style={{ border: '3px solid #4B5563', borderRadius: 3 }} />{t.legInformeel}</span>
            <span><i style={{ width: 22, height: 0, borderRadius: 0, borderTop: '2px solid #4B5563' }} />{t.legLijn}</span>
            <span><i style={{ border: '3px dashed #4B5563' }} />{t.legIndirect}</span>
            <span><b className="mono" style={{ fontSize: 11, outline: '1px dashed #8A94A3', outlineOffset: 1, padding: '0 4px' }}>CODE</b>{t.legKopie}</span>
          </div>
        </div>

        <aside id="detail" className="kaart detail" aria-live="polite">
          {huidig ? (
            <>
              <div className="labels">
                <span className="label" style={{ background: NIVEAU_KLEUR[huidig.niveau], color: '#fff' }}>{t.niveau[huidig.niveau]}</span>
                <span className="label">{huidig.formeel ? t.formeleNorm : t.informeel}</span>
              </div>
              <p className="detail-code">
                {huidig.code}
                {huidig.jaar && <span style={{ color: 'var(--tekst-3)' }}>:{huidig.jaar}</span>}
              </p>
              <h3>{volledigeTitel(huidig)}</h3>
              <div className="beleid">
                <p className="klein" style={{ margin: 0 }}>{t.waaromBeleid}</p>
                <p>{huidig.beleidsrelevantie || t.nietBeschreven}</p>
              </div>
              <dl className="kenmerken">
                {huidig.afkorting && <div><dt>{t.afkorting}</dt><dd>{huidig.afkorting}</dd></div>}
                {huidig.jaar && <div><dt>{t.jaartal}</dt><dd>{huidig.jaar}</dd></div>}
                <div><dt>{t.domeinen}</dt><dd>{domeinenVan(huidig)}</dd></div>
                <div>
                  <dt>{t.gebruikIso}</dt>
                  <dd>
                    {huidig.gebruikt_iso3166
                      ? t.direct
                      : `${t.indirect}${huidigeRelaties.some((x) => x.uit) ? `, ${t.via} ${huidigeRelaties.filter((x) => x.uit).map((x) => x.ander.code).join(', ')}` : ''}`}
                  </dd>
                </div>
                <div>
                  <dt>{t.directeRelaties}</dt>
                  <dd>
                    {huidigeRelaties.length === 0 ? (
                      <span style={{ color: 'var(--tekst-3)' }}>{t.geenRelaties}</span>
                    ) : (
                      <ul className="relaties-lijst">
                        {huidigeRelaties.map(({ r, uit, ander }) => (
                          <li key={r.id}>
                            <span style={{ color: 'var(--paars)' }}>{uit ? t.relatie[r.type] : t.relatieOmgekeerd[r.type]}</span>
                            <button type="button" className="relatie-knop" onClick={() => kies(ander.id)}>{ander.code}</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </dd>
                </div>
              </dl>
              <details className="techniek">
                <summary>{t.technisch}</summary>
                <dl className="kenmerken">
                  <div><dt>{t.type}</dt><dd>{t.typeUitleg[huidig.type] ? `${huidig.type} (${t.typeUitleg[huidig.type]})` : huidig.type}</dd></div>
                  <div><dt>{t.gebruiktDeel}</dt><dd className="mono">{huidig.iso3166_delen.join(', ') || '—'}</dd></div>
                  {huidig.gebruikt_iso3166 && (
                    <div>
                      <dt>{t.verwijzingenIso}</dt>
                      <dd>
                        {huidig.verwijzingen.length === 0 ? (
                          '—'
                        ) : (
                          <ul className="paragrafen">
                            {huidig.verwijzingen.map((v, i) => (
                              <li key={v.id ?? i}>
                                <span className="paragraaf-nr">§ {v.paragraaf_nummer}</span>
                                <span>{v.paragraaf_titel || ''}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </dd>
                    </div>
                  )}
                  <div><dt>{t.waarInNorm}</dt><dd>{huidig.element || '—'}</dd></div>
                  <div>
                    <dt>{t.bron}</dt>
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
            <p>{t.geenNormen}</p>
          )}
        </aside>
      </section>

    </>
  );
}
