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
}

export interface Relatie {
  id: string;
  van_norm_id: string;
  naar_norm_id: string;
  type: RelatieType;
  status: Status;
}

/** Rij zoals Supabase hem teruggeeft, inclusief geneste aanvullende domeinen. */
export type NormRij = Omit<Norm, 'extra_domein_ids'> & {
  norm_domeinen?: { domein_id: string }[] | null;
};

/** Volledige titel: hoofdtitel en specificatie, gescheiden door een gedachtestreepje. */
export function volledigeTitel(n: Pick<Norm, 'titel' | 'specificatie'>): string {
  return [n.titel, n.specificatie].filter((x) => x && x.trim()).join(' — ');
}

/** Code met jaartal, zoals ISO 9362:2022. */
export function codeMetJaar(n: Pick<Norm, 'code' | 'jaar'>): string {
  return n.jaar ? `${n.code}:${n.jaar}` : n.code;
}

export function naarNorm(rij: NormRij): Norm {
  const { norm_domeinen, ...rest } = rij;
  return {
    ...rest,
    organisaties: rest.organisaties ?? [],
    iso3166_delen: rest.iso3166_delen ?? [],
    extra_domein_ids: (norm_domeinen ?? []).map((d) => d.domein_id),
  };
}
