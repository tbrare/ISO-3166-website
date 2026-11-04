'use client';

import { useMemo } from 'react';
import { NIVEAU_KLEUR } from '@/lib/labels';
import { berekenWeb, MIDDEN, STRAAL_DOMEIN, WEB_B, WEB_H } from '@/lib/web-layout';
import type { Domein, Norm } from '@/lib/types';

interface Props {
  domeinen: Domein[];
  normen: Norm[];
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
  geselecteerd,
  actiefDomein,
  zichtbaar,
  onKies,
  onKiesDomein,
}: Props) {
  const { domeinKnopen, posities, takken } = useMemo(() => berekenWeb(domeinen, normen), [domeinen, normen]);
  const perId = useMemo(() => Object.fromEntries(normen.map((n) => [n.id, n])), [normen]);

  const domeinActief = (id: string) => actiefDomein === null || actiefDomein === id;
  const normActief = (n: Norm) =>
    zichtbaar(n) && (actiefDomein === null || n.hoofddomein_id === actiefDomein || n.extra_domein_ids.includes(actiefDomein));

  return (
    <div className="web">
      <svg viewBox={`0 0 ${WEB_B} ${WEB_H}`} role="img" aria-label="Spinnenweb: ISO 3166 in het midden, daaromheen de domeinen, en per domein de normen die ISO 3166 gebruiken">

        <circle cx={MIDDEN.x} cy={MIDDEN.y} r={STRAAL_DOMEIN} fill="none" stroke="#CBD2DC" strokeWidth={1} strokeDasharray="4 6" />

        {/* ISO 3166 → domeinen */}
        {domeinKnopen.map((d) => (
          <line
            key={`s-${d.id}`}
            x1={MIDDEN.x}
            y1={MIDDEN.y}
            x2={d.punt.x}
            y2={d.punt.y}
            stroke="#16202A"
            strokeWidth={3}
            opacity={domeinActief(d.id) ? 0.85 : 0.15}
          />
        ))}

        {/* Domein → normen */}
        {takken.filter((t) => !t.extra).map((t) => {
          const n = perId[t.normId];
          if (!n) return null;
          const aan = normActief(n) && (actiefDomein === null || actiefDomein === t.domeinId);
          return (
            <path
              key={`${t.domeinId}-${t.normId}`}
              d={t.d}
              fill="none"
              stroke={t.extra ? '#8A94A3' : NIVEAU_KLEUR[n.niveau]}
              strokeWidth={t.extra ? 1.2 : 1.8}
              strokeDasharray={t.extra ? '3 5' : n.status === 'bevestigd' ? undefined : '5 5'}
              opacity={aan ? (t.extra ? 0.7 : 1) : 0.12}
            />
          );
        })}

      </svg>

      <div className="web-midden" aria-hidden="true">
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
          style={{ left: pct(d.punt.x, WEB_B), top: pct(d.punt.y, WEB_H), opacity: domeinActief(d.id) ? 1 : 0.35 }}
        >
          {d.naam}
          <span className="domein-aantal">{d.aantal}</span>
        </button>
      ))}

      {normen.map((n) => {
        const p = posities[n.id];
        if (!p) return null;
        const kleur = NIVEAU_KLEUR[n.niveau];
        const gekozen = n.id === geselecteerd;
        const klassen = ['knoop-stip', n.formeel ? '' : 'informeel', n.status === 'bevestigd' ? '' : 'onzeker'].join(' ').trim();
        return (
          <button
            key={n.id}
            type="button"
            className="knoop"
            aria-pressed={gekozen}
            aria-label={`${n.code} – ${n.titel}`}
            onClick={() => onKies(n.id)}
            style={{ left: pct(p.x, WEB_B), top: pct(p.y, WEB_H), opacity: normActief(n) ? 1 : 0.15 }}
          >
            <span className={klassen} style={{ borderColor: kleur, background: gekozen ? kleur : '#fff' }} />
            <span className="knoop-label">
              {n.code}
              {n.extra_domein_ids.length > 0 && <span className="extra">+{n.extra_domein_ids.length}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
