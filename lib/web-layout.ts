import type { Domein, Niveau, Norm, Relatie } from './types';

/*
 * Alle maten zijn in eenheden van het web (1200 breed). De labels in het web schalen mee met
 * de breedte van het web (CSS-eenheid cqw: 1cqw = 12 eenheden), zodat deze berekening
 * op elk scherm klopt.
 */
export const WEB_B = 1200;
export const WEB_H = 1000;
const CX = 600;
const CY = 500;

/** Afmetingen van een domeinlabel. Alle labels zijn even breed. */
export const DOMEIN_B = 200;
const DOMEIN_H = 64;
/** Straal van de ISO 3166-cirkel in het midden, inclusief rand. */
const KERN = 66;
/** Zichtbare lengte van de lijn tussen de ISO 3166-cirkel en elk domeinlabel. */
const GAT = 170;
/** Ruimte tussen de buitenrand van een domeinlabel en de eerste normen, en de stap per volgende ring. */
const RUIMTE_NORM = 90;
const STAP = 100;

/** Maten van een normlabel (moeten overeenkomen met globals.css). */
const STIP = 17; // 1.4cqw
const CODE_LETTER = 8.64; // 1.2cqw × 0.6 (monospace)
const CODE_REGEL = 18.7; // 1.2cqw × 1.3
const SUB_LETTER = 6.6; // 1.05cqw × ±0.52
const SUB_REGEL = 16.4; // 1.05cqw × 1.3
export const SUB_MAX_B = 168; // 14cqw
const SUB_MAX_REGELS = 3;
const MARGE = 8;

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
  soort: 'domein' | 'norm';
}

interface Doos {
  id: string;
  x: number; // midden van de stip
  y: number;
  b: number;
  h: number;
  boven: number; // afstand van stipmidden tot bovenkant doos
  vast: boolean;
}

const f = (v: number) => v.toFixed(1);
const opStraal = (hoek: number, r: number): Punt => ({ x: CX + r * Math.cos(hoek), y: CY + r * Math.sin(hoek) });

/** Tekst die onder de code in het web staat: de specificatie, anders de titel. */
export function ondertitel(n: Pick<Norm, 'specificatie' | 'titel'>): string {
  return (n.specificatie && n.specificatie.trim()) || n.titel;
}

function labelMaat(n: Norm) {
  const code = n.code.length * CODE_LETTER + 12;
  const sub = ondertitel(n);
  const subB = Math.min(sub.length * SUB_LETTER, SUB_MAX_B) + 10;
  const regels = Math.min(SUB_MAX_REGELS, Math.max(1, Math.ceil((sub.length * SUB_LETTER) / SUB_MAX_B)));
  return { b: Math.max(code, subB), h: STIP + 4 + CODE_REGEL + 2 + regels * SUB_REGEL + 6, boven: STIP / 2 + 2 };
}

/** Bepaalt per norm de norm waarin hij in het verlengde ligt. Kringverwijzingen worden doorbroken. */
function bepaalOuders(normen: Norm[], relaties: Relatie[], domeinIds: Set<string>) {
  const perId = new Map(normen.map((n) => [n.id, n]));
  const ouder = new Map<string, string>();
  for (const r of relaties) {
    if (r.van_norm_id === r.naar_norm_id) continue;
    if (!perId.has(r.van_norm_id) || !perId.has(r.naar_norm_id)) continue;
    if (!ouder.has(r.van_norm_id)) ouder.set(r.van_norm_id, r.naar_norm_id);
  }
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

/** Schuift overlappende labels uit elkaar. Domeinlabels en het midden blijven staan. */
function spreid(dozen: Doos[]) {
  const rand = (d: Doos) => ({ l: d.x - d.b / 2, r: d.x + d.b / 2, t: d.y - d.boven, o: d.y - d.boven + d.h });
  for (let ronde = 0; ronde < 500; ronde++) {
    let bewogen = false;
    for (let i = 0; i < dozen.length; i++) {
      for (let j = i + 1; j < dozen.length; j++) {
        const a = dozen[i];
        const b = dozen[j];
        if (a.vast && b.vast) continue;
        const ra = rand(a);
        const rb = rand(b);
        const ox = Math.min(ra.r, rb.r) - Math.max(ra.l, rb.l) + MARGE;
        const oy = Math.min(ra.o, rb.o) - Math.max(ra.t, rb.t) + MARGE;
        if (ox <= 0 || oy <= 0) continue;
        bewogen = true;
        let dx = 0;
        let dy = 0;
        if (ox < oy) {
          const richting = Math.sign((ra.l + ra.r) / 2 - (rb.l + rb.r) / 2) || 1;
          dx = richting * (ox + 0.5);
        } else {
          const richting = Math.sign((ra.t + ra.o) / 2 - (rb.t + rb.o) / 2) || 1;
          dy = richting * (oy + 0.5);
        }
        if (a.vast) {
          b.x -= dx;
          b.y -= dy;
        } else if (b.vast) {
          a.x += dx;
          a.y += dy;
        } else {
          a.x += dx / 2;
          a.y += dy / 2;
          b.x -= dx / 2;
          b.y -= dy / 2;
        }
      }
    }
    for (const d of dozen) {
      if (d.vast) continue;
      d.x = Math.min(WEB_B - d.b / 2 - 4, Math.max(d.b / 2 + 4, d.x));
      d.y = Math.min(WEB_H - d.h + d.boven - 4, Math.max(d.boven + 4, d.y));
    }
    if (!bewogen) break;
  }
}

/**
 * Getrapte indeling: ISO 3166 in het midden, daaromheen de domeinen op gelijke hoek en met
 * gelijke lijnlengte, per domein een waaier van normen, en normen die naar een andere norm
 * verwijzen in het verlengde daarvan. Labels worden daarna zo geschoven dat ze niet overlappen.
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
  const tel = (id: string): number => 1 + (kinderen.get(id) ?? []).reduce((som, n) => som + tel(n.id), 0);

  const domeinKnopen: DomeinKnoop[] = [];
  const posities: Record<string, Punt> = {};
  // Voor het tekenen van de lijnen: waar hangt elke norm aan?
  const ophanging: Record<string, { domein?: { punt: Punt; hoek: number; afstand: number; straal: number }; ouderId?: string }> = {};
  const aantal = gesorteerd.length || 1;
  const sector = (2 * Math.PI) / aantal;

  const plaats = (
    groep: Norm[],
    start: number,
    breedte: number,
    diepte: number,
    ouderId: string | null,
    domein: { punt: Punt; hoek: number; afstand: number; straal: number }
  ) => {
    const totaal = groep.reduce((som, n) => som + bladen(n.id), 0) || 1;
    let a = start;
    const basis = domein.straal + diepte * STAP;
    groep.forEach((norm) => {
      const w = (breedte * bladen(norm.id)) / totaal;
      posities[norm.id] = opStraal(a + w / 2, basis);
      ophanging[norm.id] = ouderId ? { ouderId } : { domein };
      plaats(kinderen.get(norm.id) ?? [], a, w, diepte + 1, norm.id, domein);
      a += w;
    });
  };

  const vasteDozen: Doos[] = [{ id: '#midden', x: CX, y: CY, b: 2 * KERN, h: 2 * KERN, boven: KERN, vast: true }];

  gesorteerd.forEach((d, i) => {
    const hoek = -Math.PI / 2 + i * sector;
    const c = Math.abs(Math.cos(hoek));
    const s = Math.abs(Math.sin(hoek));
    const totRand = Math.min(c > 1e-6 ? DOMEIN_B / 2 / c : Infinity, s > 1e-6 ? DOMEIN_H / 2 / s : Infinity);
    const afstand = KERN + GAT + totRand;
    const punt = opStraal(hoek, afstand);
    const wortels = normen.filter((n) => n.hoofddomein_id === d.id && !ouder.has(n.id)).sort(sorteer);
    domeinKnopen.push({ id: d.id, naam: d.naam, punt, aantal: wortels.reduce((som, n) => som + tel(n.id), 0) });
    vasteDozen.push({ id: `#${d.id}`, x: punt.x, y: punt.y, b: DOMEIN_B, h: DOMEIN_H + 10, boven: DOMEIN_H / 2 + 10, vast: true });
    const bruikbaar = sector * 0.86;
    plaats(wortels, hoek - bruikbaar / 2, bruikbaar, 0, null, { punt, hoek, afstand, straal: afstand + totRand + RUIMTE_NORM });
  });

  // Overlap wegwerken
  const perId = new Map(normen.map((n) => [n.id, n]));
  const normDozen: Doos[] = Object.entries(posities).map(([id, p]) => ({ id, x: p.x, y: p.y, vast: false, ...labelMaat(perId.get(id)!) }));
  spreid([...vasteDozen, ...normDozen]);
  for (const d of normDozen) posities[d.id] = { x: d.x, y: d.y };

  // Lijnen tekenen vanaf de definitieve posities
  const takken: Tak[] = [];
  for (const [id, h] of Object.entries(ophanging)) {
    const p = posities[id];
    if (h.domein) {
      const c = opStraal(h.domein.hoek, (h.domein.afstand + h.domein.straal) / 2);
      const v = h.domein.punt;
      takken.push({ id: `d-${id}`, normId: id, soort: 'domein', d: `M ${f(v.x)} ${f(v.y)} Q ${f(c.x)} ${f(c.y)} ${f(p.x)} ${f(p.y)}` });
    } else if (h.ouderId && posities[h.ouderId]) {
      const v = posities[h.ouderId];
      takken.push({ id: `n-${id}`, normId: id, soort: 'norm', d: `M ${f(v.x)} ${f(v.y)} L ${f(p.x)} ${f(p.y)}` });
    }
  }

  return { domeinKnopen, posities, takken };
}

export const MIDDEN: Punt = { x: CX, y: CY };
