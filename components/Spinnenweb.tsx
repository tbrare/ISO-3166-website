'use client';

import { useMemo } from 'react';
import { NIVEAU_KLEUR } from '@/lib/labels';
import { berekenWeb, DOMEIN_B, ondertitel, WEB_B } from '@/lib/web-layout';
import type { Domein, Norm, Relatie } from '@/lib/types';

interface Props {
  domeinen: Domein[];
  normen: Norm[];
  relaties: Relatie[];
  geselecteerd: string | null;
  actiefDomein: string | null;
  zichtbaar: (n: Norm) => boolean;
  onKies: (id: string) => void;
  onKiesDomein: (id: string | null) => void;
}

const pct = (v: number, max: number) => `${(v / max) * 100}%`;

export default function Spinnenweb({
  domeinen,
  normen,
  relaties,
  geselecteerd,
  actiefDomein,
  zichtbaar,
  onKies,
  onKiesDomein,
}: Props) {
  const { domeinKnopen, knopen, takken, hoogte, midden } = useMemo(
    () => berekenWeb(domeinen, normen, relaties),
    [domeinen, normen, relaties]
  );
  const perId = useMemo(() => Object.fromEntries(normen.map((n) => [n.id, n])), [normen]);

  const domeinActief = (id: string) => actiefDomein === null || actiefDomein === id;
  const normActief = (n: Norm, takDomein?: string) =>
    zichtbaar(n) &&
    (actiefDomein === null ||
      takDomein === actiefDomein ||
      n.hoofddomein_id === actiefDomein ||
      n.extra_domein_ids.includes(actiefDomein));
  const takDomeinVan = useMemo(() => new Map(knopen.map((k) => [k.sleutel, k.takDomein])), [knopen]);

  return (
    <div className="web" style={{ aspectRatio: `${WEB_B} / ${Math.round(hoogte)}` }}>
      <svg viewBox={`0 0 ${WEB_B} ${hoogte}`} role="img" aria-label="Netwerkkaart: ISO 3166 in het midden, daaromheen de domeinen, per domein de normen die ISO 3166 gebruiken, en normen die daarop voortbouwen in het verlengde">
        {/* ISO 3166 → domeinen */}
        {domeinKnopen.map((d) => (
          <line
            key={`s-${d.id}`}
            x1={midden.x}
            y1={midden.y}
            x2={d.punt.x}
            y2={d.punt.y}
            stroke="#9AA3AF"
            strokeWidth={2}
            opacity={domeinActief(d.id) ? 1 : 0.2}
          />
        ))}

        {/* Domein → norm, en norm → norm die erop voortbouwt */}
        {takken.map((t) => {
          const n = perId[t.normId];
          if (!n) return null;
          return (
            <path
              key={t.id}
              d={t.d}
              fill="none"
              stroke={NIVEAU_KLEUR[n.niveau]}
              strokeWidth={t.soort === 'domein' ? 1.8 : 2.2}
              strokeDasharray={n.gebruikt_iso3166 ? undefined : '6 5'}
              opacity={normActief(n, takDomeinVan.get(t.sleutel)) ? (t.kopie ? 0.6 : 1) : 0.12}
            />
          );
        })}
      </svg>

      <div className="web-midden" aria-hidden="true" style={{ top: `${(midden.y / hoogte) * 100}%` }}>
        <b>ISO 3166</b>
        <span>landencodes</span>
      </div>

      {domeinKnopen.map((d) => (
        <button
          key={d.id}
          type="button"
          className="domein-knoop"
          aria-pressed={actiefDomein === d.id}
          aria-label={`Domein ${d.naam}, ${d.aantal} normen. ${actiefDomein === d.id ? 'Klik om alle domeinen te tonen.' : 'Klik om alleen dit domein te tonen.'}`}
          onClick={() => onKiesDomein(actiefDomein === d.id ? null : d.id)}
          style={{
            left: pct(d.punt.x, WEB_B),
            top: pct(d.punt.y, hoogte),
            width: pct(DOMEIN_B, WEB_B),
            opacity: domeinActief(d.id) ? 1 : 0.35,
          }}
        >
          <span className="domein-naam">{d.naam}</span>
          <span className="domein-aantal">{d.aantal}</span>
        </button>
      ))}

      {knopen.map((k) => {
        const n = perId[k.normId];
        if (!n) return null;
        const kleur = NIVEAU_KLEUR[n.niveau];
        const gekozen = n.id === geselecteerd;
        const klassen = ['knoop-stip', n.formeel ? '' : 'informeel', n.gebruikt_iso3166 ? '' : 'indirect'].join(' ').trim();
        return (
          <button
            key={k.sleutel}
            type="button"
            className={k.kopie ? 'knoop kopie' : 'knoop'}
            aria-pressed={gekozen}
            aria-label={`${n.code} – ${n.titel}${k.kopie ? ' (verwijzing; hoofddomein elders)' : ''}`}
            onClick={() => onKies(n.id)}
            style={{ left: pct(k.x, WEB_B), top: pct(k.y, hoogte), opacity: normActief(n, k.takDomein) ? 1 : 0.15 }}
          >
            <span className={klassen} style={{ borderColor: kleur, background: gekozen ? kleur : '#fff' }} />
            <span className="knoop-label">{n.code}</span>
            <span className="knoop-sub">{ondertitel(n)}</span>
          </button>
        );
      })}
    </div>
  );
}
