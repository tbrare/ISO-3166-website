export type Niveau = 'internationaal' | 'europees' | 'nationaal';
export type Status = 'concept' | 'te_verifieren' | 'bevestigd';
export type NormType = 'ISO' | 'ISO/IEC' | 'EN' | 'NEN' | 'NEN-EN-ISO' | 'Codelijst' | 'Overig';
export type RelatieType = 'verwijst_naar' | 'neemt_over' | 'gebaseerd_op' | 'vervangt';

export interface Domein {
  id: string;
  naam: string;
  omschrijving: string | null;
  volgorde: number;
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
}

export interface Iso3166Verwijzing {
  id?: string;
  paragraaf_nummer: string;
  paragraaf_titel: string | null;
  toelichting: string | null;
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
