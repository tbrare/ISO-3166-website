export type Niveau = 'internationaal' | 'europees' | 'nationaal';
export type Status = 'concept' | 'te_verifieren' | 'bevestigd';
export type NormType = 'ISO' | 'ISO/IEC' | 'EN' | 'NEN' | 'NEN-EN-ISO' | 'NPR' | 'NTA' | 'Codelijst' | 'Overig';
export type RelatieType = 'verwijst_naar' | 'neemt_over' | 'gebaseerd_op' | 'vervangt';

export interface Domein {
  id: string;
  naam: string;
  omschrijving: string | null;
  volgorde: number;
  /** Engelse vertaling (optioneel) */
  naam_en?: string | null;
  omschrijving_en?: string | null;
}

export interface Norm {
  id: string;
  code: string;
  titel: string;
  specificatie: string | null;
  afkorting: string | null;
  jaar: number | null;
  niveau: Niveau;
  type: NormType;
  formeel: boolean;
  gebruikt_iso3166: boolean;
  hoofddomein_id: string | null;
  organisaties: string[];
  toepassing: string;
  beleidsrelevantie: string | null;
  iso3166_delen: string[];
  element: string | null;
  afwijkingen: string | null;
  iso3166_editie: string | null;
  bron: string | null;
  status: Status;
  extra_domein_ids: string[];
  verwijzingen: Iso3166Verwijzing[];
  /** Engelse vertalingen (optioneel; leeg = Nederlandse tekst) */
  titel_en?: string | null;
  specificatie_en?: string | null;
  toepassing_en?: string | null;
  beleidsrelevantie_en?: string | null;
}

export interface Iso3166Verwijzing {
  id?: string;
  paragraaf_nummer: string;
  paragraaf_titel: string | null;
  /** Alleen beschikbaar voor beheerders */
  toelichting?: string | null;
  volgorde: number;
}

export interface Relatie {
  id: string;
  van_norm_id: string;
  naar_norm_id: string;
  type: RelatieType;
  status: Status;
}

/** Rij zoals Supabase hem teruggeeft, inclusief geneste aanvullende domeinen. */
export type NormRij = Omit<Norm, 'extra_domein_ids' | 'verwijzingen'> & {
  norm_domeinen?: { domein_id: string }[] | null;
  iso3166_verwijzingen?: Iso3166Verwijzing[] | null;
};

/** Kolommen die we samen met een norm ophalen. */
export const NORM_SELECT =
  '*, norm_domeinen(domein_id), iso3166_verwijzingen(id, paragraaf_nummer, paragraaf_titel, toelichting, volgorde)';

/** Publieke variant: paragraafnummer en -titel wel, de toelichting niet (die is alleen voor beheer). */
export const NORM_SELECT_PUBLIEK =
  '*, norm_domeinen(domein_id), iso3166_verwijzingen(id, paragraaf_nummer, paragraaf_titel, volgorde)';

/** Volledige titel: hoofdtitel en specificatie, gescheiden door een gedachtestreepje. */
export function volledigeTitel(n: Pick<Norm, 'titel' | 'specificatie'>): string {
  return [n.titel, n.specificatie].filter((x) => x && x.trim()).join(' — ');
}

/** Code met jaartal, zoals ISO 9362:2022. */
export function codeMetJaar(n: Pick<Norm, 'code' | 'jaar'>): string {
  return n.jaar ? `${n.code}:${n.jaar}` : n.code;
}

export function naarNorm(rij: NormRij): Norm {
  const { norm_domeinen, iso3166_verwijzingen, ...rest } = rij;
  return {
    ...rest,
    organisaties: rest.organisaties ?? [],
    iso3166_delen: rest.iso3166_delen ?? [],
    extra_domein_ids: (norm_domeinen ?? []).map((d) => d.domein_id),
    verwijzingen: [...(iso3166_verwijzingen ?? [])].sort((a, b) => a.volgorde - b.volgorde),
  };
}

const gevuld = (v?: string | null) => (v && v.trim() ? v : null);

/** Engelse weergave van een norm: vertaalde velden waar ingevuld, anders de Nederlandse tekst. */
export function normInTaal(n: Norm, taal: 'nl' | 'en'): Norm {
  if (taal === 'nl') return n;
  return {
    ...n,
    titel: gevuld(n.titel_en) ?? n.titel,
    specificatie: gevuld(n.specificatie_en) ?? n.specificatie,
    toepassing: gevuld(n.toepassing_en) ?? n.toepassing,
    beleidsrelevantie: gevuld(n.beleidsrelevantie_en) ?? n.beleidsrelevantie,
  };
}

export function domeinInTaal(d: Domein, taal: 'nl' | 'en'): Domein {
  if (taal === 'nl') return d;
  return { ...d, naam: gevuld(d.naam_en) ?? d.naam, omschrijving: gevuld(d.omschrijving_en) ?? d.omschrijving };
}
