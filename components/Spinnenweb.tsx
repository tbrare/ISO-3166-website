'use client';

import { useMemo } from 'react';
import { NIVEAU_KLEUR } from '@/lib/labels';
import { berekenWeb, MIDDEN, RING, relatieLijn, WEB_B, WEB_H } from '@/lib/web-layout';
import type { Domein, Norm, Relatie } from '@/lib/types';
import { RELATIE_LABEL } from '@/lib/labels';

interface Props {
  domeinen: Domein[];
  normen: Norm[];
  relaties: Relatie[];
  geselecteerd: string | null;
  zichtbaar: (n: Norm) => boolean;
  toonRelaties: boolean;
  onKies: (id: string) => void;
}

export default function Spinnenweb({ domeinen, normen, relaties, geselecteerd, zichtbaar, toonRelaties, onKies }: Props) {
  const { draden, posities } = useMemo(() => berekenWeb(domeinen, normen), [domeinen, normen]);
  const perId = useMemo(() => Object.fromEntries(normen.map((n) => [n.id, n])), [normen]);
  const lijnen = useMemo(
    () =>
      relaties
        .map((r) => ({ r, lijn: relatieLijn(r, posities) }))
        .filter((x): x is { r: Relatie; lijn: NonNullable<ReturnType<typeof relatieLijn>> } => x.lijn !== null),
    [relaties, posities]
  );

  return (
    <div className="web">
      <svg viewBox={`0 0 ${WEB_B} ${WEB_H}`} role="img" aria-label="Spinnenweb van normen en codelijsten rond ISO 3166, per domein en niveau">
        <defs>
          <marker id="relatiepijl" orient="auto" markerWidth="8" markerHeight="8" refX="7" refY="4" markerUnits="userSpaceOnUse">
            <path d="M0 0 L8 4 L0 8 Z" fill="#6D28D9" />
          </marker>
        </defs>

        {Object.values(RING).map((r) => (
          <circle key={r} cx={MIDDEN.x} cy={MIDDEN.y} r={r} fill="none" stroke="#CBD2DC" strokeWidth={1} strokeDasharray="4 6" />
        ))}

        {draden.map((d) => (
          <line key={d.id} x1={MIDDEN.x} y1={MIDDEN.y} x2={d.eind.x} y2={d.eind.y} stroke="#CBD2DC" strokeWidth={1} />
        ))}

        {normen.map((n) => {
          const p = posities[n.id];
          if (!p) return null;
          return (
            <line
              key={`l-${n.id}`}
              x1={MIDDEN.x}
              y1={MIDDEN.y}
              x2={p.x}
              y2={p.y}
              stroke={NIVEAU_KLEUR[n.niveau]}
              strokeWidth={1.5}
              strokeDasharray={n.status === 'bevestigd' ? undefined : '5 5'}
              opacity={zichtbaar(n) ? 1 : 0.15}
            />
          );
        })}

        {toonRelaties &&
          lijnen.map(({ r, lijn }) => {
            const a = perId[r.van_norm_id];
            const b = perId[r.naar_norm_id];
            if (!a || !b || !zichtbaar(a) || !zichtbaar(b)) return null;
            return (
              <g key={r.id}>
                <path
                  d={lijn.d}
                  fill="none"
                  stroke="#6D28D9"
                  strokeWidth={2}
                  strokeDasharray={r.status === 'bevestigd' ? undefined : '6 5'}
                  markerEnd="url(#relatiepijl)"
                />
                <text x={lijn.label.x} y={lijn.label.y} textAnchor="middle" fontSize={12} fill="#6D28D9">
                  {RELATIE_LABEL[r.type]}
                </text>
              </g>
            );
          })}

        {draden.map((d) => (
          <text key={`t-${d.id}`} x={d.label.x} y={d.label.y} textAnchor={d.anker} fontSize={16} fontWeight={600} fill="#16202A">
            {d.naam}
          </text>
        ))}

        {(['internationaal', 'europees', 'nationaal'] as const).map((niv) => (
          <text key={niv} x={MIDDEN.x} y={MIDDEN.y - RING[niv] - 8} textAnchor="middle" fontSize={11} letterSpacing={1} fill="#4B5563" fontFamily="var(--mono)">
            {niv.toUpperCase()}
          </text>
        ))}
      </svg>

      <div className="web-midden" aria-hidden="true">
        <b>ISO 3166</b>
        <span>landencodes</span>
      </div>

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
            style={{ left: `${(p.x / WEB_B) * 100}%`, top: `${(p.y / WEB_H) * 100}%`, opacity: zichtbaar(n) ? 1 : 0.15 }}
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
