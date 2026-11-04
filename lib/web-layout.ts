import type { Domein, Niveau, Norm, Relatie } from './types';

export const WEB_B = 1000;
export const WEB_H = 800;
const CX = 500;
const CY = 400;

export const RING: Record<Niveau, number> = {
  internationaal: 150,
  europees: 235,
  nationaal: 320,
};

export interface Punt {
  x: number;
  y: number;
}

export interface Draad {
  id: string;
  naam: string;
  eind: Punt;
  label: Punt;
  anker: 'start' | 'middle' | 'end';
}

export interface RelatieLijn {
  id: string;
  d: string;
  label: Punt;
}

/** Berekent de draden (domeinen) en de positie van elke norm in het web. */
export function berekenWeb(domeinen: Domein[], normen: Norm[]) {
  const gesorteerd = [...domeinen].sort((a, b) => a.volgorde - b.volgorde);
  const n = Math.max(gesorteerd.length, 1);
  const hoek: Record<string, number> = {};

  const draden: Draad[] = gesorteerd.map((d, i) => {
    const a = (i * 2 * Math.PI) / n;
    hoek[d.id] = a;
    const c = Math.cos(a);
    return {
      id: d.id,
      naam: d.naam,
      eind: { x: CX + 345 * c, y: CY + 345 * Math.sin(a) },
      label: { x: CX + 360 * c, y: CY + 360 * Math.sin(a) + 5 },
      anker: c > 0.3 ? 'start' : c < -0.3 ? 'end' : 'middle',
    };
  });

  const groepen: Record<string, Norm[]> = {};
  for (const norm of normen) {
    if (!norm.hoofddomein_id || hoek[norm.hoofddomein_id] === undefined) continue;
    const sleutel = `${norm.hoofddomein_id}|${norm.niveau}`;
    (groepen[sleutel] ??= []).push(norm);
  }

  const posities: Record<string, Punt> = {};
  for (const groep of Object.values(groepen)) {
    groep.sort((a, b) => a.code.localeCompare(b.code));
    const eerste = groep[0];
    const r = RING[eerste.niveau];
    const basis = hoek[eerste.hoofddomein_id as string];
    const stap = 56 / r;
    groep.forEach((norm, k) => {
      const a = basis + (k - (groep.length - 1) / 2) * stap;
      posities[norm.id] = { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
    });
  }

  return { draden, posities };
}

/** Gebogen lijn tussen twee normen, met de bocht weg van het midden. */
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
  if (l < 80) {
    // Normen aan weerszijden van het midden: buig om de onderkant heen
    cx = CX;
    cy = CY + 430;
  } else {
    cx = mx + (vx / l) * 90;
    cy = my + (vy / l) * 90;
  }
  // Pijlpunt net vóór het bolletje laten stoppen
  const dx = b.x - cx;
  const dy = b.y - cy;
  const l2 = Math.hypot(dx, dy) || 1;
  const ex = b.x - (dx / l2) * 14;
  const ey = b.y - (dy / l2) * 14;
  const f = (v: number) => v.toFixed(1);
  return {
    id: relatie.id,
    d: `M ${f(a.x)} ${f(a.y)} Q ${f(cx)} ${f(cy)} ${f(ex)} ${f(ey)}`,
    label: { x: 0.25 * a.x + 0.5 * cx + 0.25 * b.x, y: 0.25 * a.y + 0.5 * cy + 0.25 * b.y + 16 },
  };
}

export const MIDDEN: Punt = { x: CX, y: CY };
