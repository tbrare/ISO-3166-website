import type { Domein, Niveau, Norm, Relatie } from './types';

/*
 * Alle maten zijn in eenheden van het web (1200 breed). De labels in het web schalen mee met
 * de breedte van het web (CSS-eenheid cqw: 1cqw = 12 eenheden), zodat deze berekening
 * op elk scherm klopt.
 */
export const WEB_B = 1200;
const CX = 600;
const CY = 500;

/** Afmetingen van een domeinlabel. Alle labels zijn even breed. */
export const DOMEIN_B = 200;
const DOMEIN_H = 64;
/** Straal van de ISO 3166-cirkel in het midden, inclusief rand. */
const KERN = 66;
/** Minimale zichtbare lengte van de lijn tussen de ISO 3166-cirkel en elk domeinlabel. */
const GAT_MIN = 120;
/** Minimale ruimte tussen twee domeinlabels. */
const DOMEIN_TUSSENRUIMTE = 18;
/** Ruimte tussen de buitenrand van een domeinlabel en de eerste normen, en de stap per volgende ring. */
const RUIMTE_NORM = 90;
const STAP = 100;

/** Maten van een normlabel (moeten overeenkomen met globals.css). */
const STIP = 17; // 1.4cqw
const CODE_LETTER = 8.2; // 1.2cqw × ±0.57 (Source Sans 3, vet)
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
  /** Sleutel van de knoop waar de tak naartoe loopt */
  sleutel: string;
  normId: string;
  d: string;
  soort: 'domein' | 'norm';
  kopie: boolean;
}

/** Een plek waar een norm in het web staat. Een norm kan twee keer voorkomen: in zijn eigen domein en als verwijzing. */
export interface Knoop {
  sleutel: string;
  normId: string;
  kopie: boolean;
  takDomein: string;
  x: number;
  y: number;
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

/**
 * Bepaalt per norm de norm waarnaar hij (als eerste) verwijst.
 * - Zelfde hoofddomein: de norm hangt alleen in het verlengde van die norm (boomOuder).
 * - Ander hoofddomein: de norm staat in zijn eigen domein én als verwijzing bij die norm (kopieOuder).
 */
function bepaalOuders(normen: Norm[], relaties: Relatie[], domeinIds: Set<string>) {
  const perId = new Map(normen.map((n) => [n.id, n]));
  const eerste = new Map<string, string>();
  for (const r of relaties) {
    if (r.van_norm_id === r.naar_norm_id) continue;
    if (!perId.has(r.van_norm_id) || !perId.has(r.naar_norm_id)) continue;
    if (!eerste.has(r.van_norm_id)) eerste.set(r.van_norm_id, r.naar_norm_id);
  }
  const geldigDomein = (n?: Norm) => !!n?.hoofddomein_id && domeinIds.has(n.hoofddomein_id);

  const boomOuder = new Map<string, string>();
  const kopieOuder = new Map<string, string>();
  for (const [van, naar] of eerste) {
    const a = perId.get(van);
    const b = perId.get(naar);
    if (geldigDomein(a) && geldigDomein(b) && a!.hoofddomein_id !== b!.hoofddomein_id) kopieOuder.set(van, naar);
    else boomOuder.set(van, naar);
  }
  // Kringen doorbreken en ketens die nergens in het web uitkomen loskoppelen
  for (let ronde = 0; ronde < 3; ronde++) {
    for (const id of [...boomOuder.keys()]) {
      const gezien = new Set([id]);
      let huidig = boomOuder.get(id);
      let wortel = id;
      let kring = false;
      while (huidig) {
        if (gezien.has(huidig)) {
          kring = true;
          break;
        }
        gezien.add(huidig);
        wortel = huidig;
        huidig = boomOuder.get(huidig);
      }
      if (kring || !geldigDomein(perId.get(wortel))) boomOuder.delete(id);
    }
  }
  return { boomOuder, kopieOuder };
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
  const { boomOuder, kopieOuder } = bepaalOuders(normen, relaties, domeinIds);
  const perId = new Map(normen.map((n) => [n.id, n]));

  const sorteer = (a: Norm, b: Norm) =>
    NIVEAU_VOLGORDE[a.niveau] - NIVEAU_VOLGORDE[b.niveau] || a.code.localeCompare(b.code);

  // Kinderen per norm: eerst echte vervolgnormen, daarna verwijzingen uit andere domeinen
  interface Kind {
    norm: Norm;
    kopie: boolean;
  }
  const kinderen = new Map<string, Kind[]>();
  const voegToe = (ouderId: string, norm: Norm, kopie: boolean) =>
    kinderen.set(ouderId, [...(kinderen.get(ouderId) ?? []), { norm, kopie }]);
  for (const n of normen) {
    const b = boomOuder.get(n.id);
    if (b) voegToe(b, n, false);
    const k = kopieOuder.get(n.id);
    if (k) voegToe(k, n, true);
  }
  for (const lijst of kinderen.values()) lijst.sort((a, b) => Number(a.kopie) - Number(b.kopie) || sorteer(a.norm, b.norm));

  const bladen = (kind: Kind): number => {
    if (kind.kopie) return 1;
    const k = kinderen.get(kind.norm.id) ?? [];
    return k.length === 0 ? 1 : k.reduce((som, x) => som + bladen(x), 0);
  };

  interface DomeinInfo {
    id: string;
    punt: Punt;
    hoek: number;
    afstand: number;
    straal: number;
  }

  const domeinKnopen: DomeinKnoop[] = [];
  const knopen: Knoop[] = [];
  const ophanging = new Map<string, { domein?: DomeinInfo; ouderSleutel?: string }>();
  // Alleen domeinen met minimaal één norm komen in de kaart
  const zichtbareDomeinen = gesorteerd.filter((d) => normen.some((n) => n.hoofddomein_id === d.id));
  const aantal = zichtbareDomeinen.length || 1;
  const sector = (2 * Math.PI) / aantal;

  const plaats = (groep: Kind[], start: number, breedte: number, diepte: number, ouderSleutel: string | null, domein: DomeinInfo) => {
    const totaal = groep.reduce((som, k) => som + bladen(k), 0) || 1;
    let a = start;
    const basis = domein.straal + diepte * STAP;
    for (const kind of groep) {
      const w = (breedte * bladen(kind)) / totaal;
      const p = opStraal(a + w / 2, basis);
      const sleutel = kind.kopie ? `${kind.norm.id}@${ouderSleutel}` : kind.norm.id;
      knopen.push({ sleutel, normId: kind.norm.id, kopie: kind.kopie, takDomein: domein.id, x: p.x, y: p.y });
      ophanging.set(sleutel, ouderSleutel ? { ouderSleutel } : { domein });
      if (!kind.kopie) plaats(kinderen.get(kind.norm.id) ?? [], a, w, diepte + 1, sleutel, domein);
      a += w;
    }
  };

  const vasteDozen: Doos[] = [{ id: '#midden', x: CX, y: CY, b: 2 * KERN, h: 2 * KERN, boven: KERN, vast: true }];

  // Domeinposities: gelijke hoek en gelijke lijnlengte. De lijnlengte groeit tot geen enkel label een ander raakt.
  const domeinGeometrie = (gat: number) =>
    zichtbareDomeinen.map((d, i) => {
      const hoek = -Math.PI / 2 + i * sector;
      const c = Math.abs(Math.cos(hoek));
      const s = Math.abs(Math.sin(hoek));
      const totRand = Math.min(c > 1e-6 ? DOMEIN_B / 2 / c : Infinity, s > 1e-6 ? DOMEIN_H / 2 / s : Infinity);
      const afstand = KERN + gat + totRand;
      return { d, hoek, totRand, afstand, punt: opStraal(hoek, afstand) };
    });
  const raken = (g: ReturnType<typeof domeinGeometrie>) =>
    g.some((a, i) =>
      g.some(
        (b, j) =>
          j > i &&
          Math.abs(a.punt.x - b.punt.x) < DOMEIN_B + DOMEIN_TUSSENRUIMTE &&
          Math.abs(a.punt.y - b.punt.y) < DOMEIN_H + DOMEIN_TUSSENRUIMTE
      )
    );
  let gat = GAT_MIN;
  let geometrie = domeinGeometrie(gat);
  while (raken(geometrie) && gat < 800) {
    gat += 5;
    geometrie = domeinGeometrie(gat);
  }

  for (const { d, hoek, totRand, afstand, punt } of geometrie) {
    const wortels = normen
      .filter((n) => n.hoofddomein_id === d.id && !boomOuder.has(n.id))
      .sort(sorteer)
      .map((norm) => ({ norm, kopie: false }));
    domeinKnopen.push({ id: d.id, naam: d.naam, punt, aantal: normen.filter((n) => n.hoofddomein_id === d.id).length });
    vasteDozen.push({ id: `#${d.id}`, x: punt.x, y: punt.y, b: DOMEIN_B, h: DOMEIN_H + 10, boven: DOMEIN_H / 2 + 10, vast: true });
    const bruikbaar = sector * 0.86;
    plaats(wortels, hoek - bruikbaar / 2, bruikbaar, 0, null, { id: d.id, punt, hoek, afstand, straal: afstand + totRand + RUIMTE_NORM });
  }

  // Overlap wegwerken
  const normDozen: Doos[] = knopen.map((k) => ({ id: k.sleutel, x: k.x, y: k.y, vast: false, ...labelMaat(perId.get(k.normId)!) }));
  spreid([...vasteDozen, ...normDozen]);

  // Hoogte laten meegroeien met de inhoud en alles naar boven schuiven
  const alle = [...vasteDozen, ...normDozen];
  const boven = Math.min(...alle.map((d) => d.y - d.boven));
  const onder = Math.max(...alle.map((d) => d.y - d.boven + d.h));
  const verschuiving = 24 - boven;
  const hoogte = Math.max(400, onder - boven + 48);
  for (const d of normDozen) d.y += verschuiving;
  for (const k of domeinKnopen) k.punt = { x: k.punt.x, y: k.punt.y + verschuiving };
  const midden: Punt = { x: CX, y: CY + verschuiving };
  const domeinPunt = new Map(domeinKnopen.map((k) => [k.id, k.punt]));
  const posities = new Map<string, Punt>();
  normDozen.forEach((d, i) => {
    knopen[i].x = d.x;
    knopen[i].y = d.y;
    posities.set(d.id, { x: d.x, y: d.y });
  });

  // Lijnen tekenen vanaf de definitieve posities
  const takken: Tak[] = [];
  for (const k of knopen) {
    const h = ophanging.get(k.sleutel);
    if (!h) continue;
    if (h.domein) {
      const c0 = opStraal(h.domein.hoek, (h.domein.afstand + h.domein.straal) / 2);
      const c = { x: c0.x, y: c0.y + verschuiving };
      const v = domeinPunt.get(h.domein.id) ?? h.domein.punt;
      takken.push({ id: `d-${k.sleutel}`, sleutel: k.sleutel, normId: k.normId, soort: 'domein', kopie: k.kopie, d: `M ${f(v.x)} ${f(v.y)} Q ${f(c.x)} ${f(c.y)} ${f(k.x)} ${f(k.y)}` });
    } else if (h.ouderSleutel) {
      const v = posities.get(h.ouderSleutel);
      if (!v) continue;
      takken.push({ id: `n-${k.sleutel}`, sleutel: k.sleutel, normId: k.normId, soort: 'norm', kopie: k.kopie, d: `M ${f(v.x)} ${f(v.y)} L ${f(k.x)} ${f(k.y)}` });
    }
  }

  return { domeinKnopen, knopen, takken, hoogte, midden };
}
