import type { Domein, Niveau, Norm, Relatie } from './types';

export const WEB_B = 1000;
export const WEB_H = 800;
const CX = 500;
const CY = 400;

/** Afstand van het midden tot de domeinen en tot de normen. */
export const STRAAL_DOMEIN = 195;
const STRAAL_NORM = 345;
const STRAAL_NORM_BINNEN = 315;
const STRAAL_NORM_BUITEN = 372;

const NIVEAU_VOLGORDE: Record<Niveau, number> = { internationaal: 0, europees: 1, nationaal: 2 };

export interface Punt {
  x: number;
  y: number;
}

export interface DomeinKnoop {
  id: string;
  naam: string;
  punt: Punt;
  hoek: number;
  aantal: number;
}

export interface Tak {
  normId: string;
  domeinId: string;
  d: string;
  extra: boolean;
}

export interface RelatieLijn {
  id: string;
  d: string;
  label: Punt;
}

const f = (v: number) => v.toFixed(1);
const opStraal = (hoek: number, r: number): Punt => ({ x: CX + r * Math.cos(hoek), y: CY + r * Math.sin(hoek) });

/** Gebogen tak van een domein naar een norm. */
function takPad(van: Punt, naar: Punt, hoek: number): string {
  const c = opStraal(hoek, (STRAAL_DOMEIN + STRAAL_NORM) / 2 + 10);
  return `M ${f(van.x)} ${f(van.y)} Q ${f(c.x)} ${f(c.y)} ${f(naar.x)} ${f(naar.y)}`;
}

/**
 * Getrapte indeling: ISO 3166 in het midden, daaromheen de domeinen,
 * en per domein een waaier van de normen die eronder vallen.
 * Elk domein krijgt een sector die meegroeit met het aantal normen.
 */
export function berekenWeb(domeinen: Domein[], normen: Norm[]) {
  const gesorteerd = [...domeinen].sort((a, b) => a.volgorde - b.volgorde);

  const perDomein: Record<string, Norm[]> = {};
  for (const d of gesorteerd) perDomein[d.id] = [];
  for (const n of normen) {
    if (n.hoofddomein_id && perDomein[n.hoofddomein_id]) perDomein[n.hoofddomein_id].push(n);
  }

  const gewicht = (id: string) => Math.max(2.2, perDomein[id].length);
  const totaal = gesorteerd.reduce((som, d) => som + gewicht(d.id), 0) || 1;

  const domeinKnopen: DomeinKnoop[] = [];
  const posities: Record<string, Punt> = {};
  const hoekVanDomein: Record<string, number> = {};
  const takken: Tak[] = [];

  // Start linksboven zodat de eerste domeinen bovenaan beginnen
  let start = -Math.PI / 2 - (Math.PI * gewicht(gesorteerd[0]?.id ?? '')) / totaal;

  for (const d of gesorteerd) {
    const breedte = (2 * Math.PI * gewicht(d.id)) / totaal;
    const midden = start + breedte / 2;
    hoekVanDomein[d.id] = midden;
    const punt = opStraal(midden, STRAAL_DOMEIN);
    domeinKnopen.push({ id: d.id, naam: d.naam, punt, hoek: midden, aantal: perDomein[d.id].length });

    const groep = [...perDomein[d.id]].sort(
      (a, b) => NIVEAU_VOLGORDE[a.niveau] - NIVEAU_VOLGORDE[b.niveau] || a.code.localeCompare(b.code)
    );
    const marge = breedte * 0.12;
    const bruikbaar = breedte - 2 * marge;
    const m = groep.length;
    // Liggen de labels te dicht op elkaar, dan om en om naar binnen en buiten
    const ruimtePerNorm = m > 0 ? (bruikbaar * STRAAL_NORM) / m : Infinity;
    const verspringen = ruimtePerNorm < 78;

    groep.forEach((norm, k) => {
      const hoek = m === 1 ? midden : start + marge + (bruikbaar * (k + 0.5)) / m;
      const r = verspringen ? (k % 2 === 0 ? STRAAL_NORM_BINNEN : STRAAL_NORM_BUITEN) : STRAAL_NORM;
      const p = opStraal(hoek, r);
      posities[norm.id] = p;
      takken.push({ normId: norm.id, domeinId: d.id, d: takPad(punt, p, midden), extra: false });
    });

    start += breedte;
  }

  // Stippellijnen vanuit aanvullende domeinen
  for (const n of normen) {
    const p = posities[n.id];
    if (!p) continue;
    for (const extraId of n.extra_domein_ids) {
      const knoop = domeinKnopen.find((k) => k.id === extraId);
      if (!knoop || extraId === n.hoofddomein_id) continue;
      takken.push({ normId: n.id, domeinId: extraId, d: `M ${f(knoop.punt.x)} ${f(knoop.punt.y)} L ${f(p.x)} ${f(p.y)}`, extra: true });
    }
  }

  return { domeinKnopen, posities, takken };
}

/** Gebogen lijn tussen twee normen, met de bocht naar buiten. */
export function relatieLijn(relatie: Relatie, posities: Record<string, Punt>): RelatieLijn | null {
  const a = posities[relatie.van_norm_id];
  const b = posities[relatie.naar_norm_id];
  if (!a || !b) return null;
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const vx = mx - CX;
  const vy = my - CY;
  const l = Math.hypot(vx, vy);
  let cx: number;
  let cy: number;
  if (l < 120) {
    // Normen aan weerszijden van het web: buig loodrecht op de verbindingslijn
    const nx = -(b.y - a.y);
    const ny = b.x - a.x;
    const nl = Math.hypot(nx, ny) || 1;
    cx = mx + (nx / nl) * 260;
    cy = my + (ny / nl) * 260;
  } else {
    cx = mx + (vx / l) * 90;
    cy = my + (vy / l) * 90;
  }
  const dx = b.x - cx;
  const dy = b.y - cy;
  const l2 = Math.hypot(dx, dy) || 1;
  const ex = b.x - (dx / l2) * 14;
  const ey = b.y - (dy / l2) * 14;
  return {
    id: relatie.id,
    d: `M ${f(a.x)} ${f(a.y)} Q ${f(cx)} ${f(cy)} ${f(ex)} ${f(ey)}`,
    label: { x: 0.25 * a.x + 0.5 * cx + 0.25 * b.x, y: 0.25 * a.y + 0.5 * cy + 0.25 * b.y + 16 },
  };
}

export const MIDDEN: Punt = { x: CX, y: CY };
