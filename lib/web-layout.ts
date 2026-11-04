import type { Domein, Niveau, Norm, Relatie } from './types';

export const WEB_B = 1200;
export const WEB_H = 1000;
const CX = 600;
const CY = 500;

/** Afmetingen van een domeinlabel (in eenheden van het web). Alle labels zijn even breed. */
export const DOMEIN_B = 200;
const DOMEIN_H = 64;
/** Straal van de ISO 3166-cirkel in het midden, inclusief rand. */
const KERN = 66;
/** Zichtbare afstand tussen de ISO 3166-cirkel en de rand van elk domeinlabel. */
const GAT = 170;
/** Ruimte tussen de buitenrand van een domeinlabel en de eerste normen, en de stap per volgende ring. */
const RUIMTE_NORM = 90;
const STAP = 72;

const NIVEAU_VOLGORDE: Record<Niveau, number> = { internationaal: 0, europees: 1, nationaal: 2 };

export interface Punt {
  x: number;
  y: number;
}

export interface DomeinKnoop {
  id: string;
  naam: string;
  punt: Punt;
  aantal: number;
}

export interface Tak {
  id: string;
  normId: string;
  d: string;
  /** 'domein' = van domein naar norm, 'norm' = van norm naar een norm die erop voortbouwt */
  soort: 'domein' | 'norm';
}

const f = (v: number) => v.toFixed(1);
const opStraal = (hoek: number, r: number): Punt => ({ x: CX + r * Math.cos(hoek), y: CY + r * Math.sin(hoek) });

/**
 * Bepaalt per norm de 'ouder': de norm waarnaar hij verwijst of waarop hij voortbouwt.
 * Zo'n norm komt in het verlengde van zijn ouder te liggen. Kringverwijzingen worden doorbroken.
 */
function bepaalOuders(normen: Norm[], relaties: Relatie[], domeinIds: Set<string>) {
  const perId = new Map(normen.map((n) => [n.id, n]));
  const ouder = new Map<string, string>();
  for (const r of relaties) {
    if (r.van_norm_id === r.naar_norm_id) continue;
    if (!perId.has(r.van_norm_id) || !perId.has(r.naar_norm_id)) continue;
    if (!ouder.has(r.van_norm_id)) ouder.set(r.van_norm_id, r.naar_norm_id);
  }
  // Kringen doorbreken en ketens zonder geldig domein loskoppelen
  for (let ronde = 0; ronde < 3; ronde++) {
    for (const id of [...ouder.keys()]) {
      const gezien = new Set([id]);
      let huidig = ouder.get(id);
      let wortel = id;
      let kring = false;
      while (huidig) {
        if (gezien.has(huidig)) {
          kring = true;
          break;
        }
        gezien.add(huidig);
        wortel = huidig;
        huidig = ouder.get(huidig);
      }
      const wortelDomein = perId.get(wortel)?.hoofddomein_id;
      if (kring || !wortelDomein || !domeinIds.has(wortelDomein)) ouder.delete(id);
    }
  }
  return ouder;
}

/**
 * Getrapte indeling: ISO 3166 in het midden, daaromheen de domeinen op gelijke onderlinge hoek
 * en met gelijke zichtbare afstand tot het midden, per domein een waaier van normen, en normen
 * die naar een andere norm verwijzen in het verlengde van die norm.
 */
export function berekenWeb(domeinen: Domein[], normen: Norm[], relaties: Relatie[]) {
  const gesorteerd = [...domeinen].sort((a, b) => a.volgorde - b.volgorde);
  const domeinIds = new Set(gesorteerd.map((d) => d.id));
  const ouder = bepaalOuders(normen, relaties, domeinIds);

  const sorteer = (a: Norm, b: Norm) =>
    NIVEAU_VOLGORDE[a.niveau] - NIVEAU_VOLGORDE[b.niveau] || a.code.localeCompare(b.code);

  const kinderen = new Map<string, Norm[]>();
  for (const n of normen) {
    const o = ouder.get(n.id);
    if (o) kinderen.set(o, [...(kinderen.get(o) ?? []), n]);
  }
  for (const lijst of kinderen.values()) lijst.sort(sorteer);

  const bladen = (id: string): number => {
    const k = kinderen.get(id) ?? [];
    return k.length === 0 ? 1 : k.reduce((som, n) => som + bladen(n.id), 0);
  };

  const domeinKnopen: DomeinKnoop[] = [];
  const posities: Record<string, Punt> = {};
  const takken: Tak[] = [];
  const aantal = gesorteerd.length || 1;
  const sector = (2 * Math.PI) / aantal;

  const plaats = (groep: Norm[], start: number, breedte: number, diepte: number, van: Punt, domeinHoek: number, domeinAfstand: number, straalNorm: number) => {
    const totaal = groep.reduce((som, n) => som + bladen(n.id), 0) || 1;
    let a = start;
    const basis = straalNorm + diepte * STAP;
    const krap = groep.length > 1 && (breedte * basis) / groep.length < 80;
    groep.forEach((norm, k) => {
      const w = (breedte * bladen(norm.id)) / totaal;
      const hoek = a + w / 2;
      const r = krap ? basis + (k % 2 === 0 ? -22 : 22) : basis;
      const p = opStraal(hoek, r);
      posities[norm.id] = p;
      if (diepte === 0) {
        const c = opStraal(domeinHoek, (domeinAfstand + straalNorm) / 2);
        takken.push({ id: `d-${norm.id}`, normId: norm.id, soort: 'domein', d: `M ${f(van.x)} ${f(van.y)} Q ${f(c.x)} ${f(c.y)} ${f(p.x)} ${f(p.y)}` });
      } else {
        takken.push({ id: `n-${norm.id}`, normId: norm.id, soort: 'norm', d: `M ${f(van.x)} ${f(van.y)} L ${f(p.x)} ${f(p.y)}` });
      }
      plaats(kinderen.get(norm.id) ?? [], a, w, diepte + 1, p, domeinHoek, domeinAfstand, straalNorm);
      a += w;
    });
  };

  gesorteerd.forEach((d, i) => {
    const hoek = -Math.PI / 2 + i * sector;
    // Afstand zo kiezen dat de verbindingslijn van ISO 3166 tot de rand van elk label even lang is
    const c = Math.abs(Math.cos(hoek));
    const s = Math.abs(Math.sin(hoek));
    const totRand = Math.min(c > 1e-6 ? DOMEIN_B / 2 / c : Infinity, s > 1e-6 ? DOMEIN_H / 2 / s : Infinity);
    const afstand = KERN + GAT + totRand;
    const punt = opStraal(hoek, afstand);
    const wortels = normen.filter((n) => n.hoofddomein_id === d.id && !ouder.has(n.id)).sort(sorteer);
    domeinKnopen.push({ id: d.id, naam: d.naam, punt, aantal: normen.filter((n) => n.hoofddomein_id === d.id).length });
    const bruikbaar = sector * 0.86;
    // Normen beginnen op vaste afstand buiten de rand van het domeinlabel
    plaats(wortels, hoek - bruikbaar / 2, bruikbaar, 0, punt, hoek, afstand, afstand + totRand + RUIMTE_NORM);
  });

  return { domeinKnopen, posities, takken };
}

export const MIDDEN: Punt = { x: CX, y: CY };
