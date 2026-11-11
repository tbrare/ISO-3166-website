import type { Niveau, NormType, RelatieType, Status } from './types';

export const NIVEAUS: Niveau[] = ['internationaal', 'europees', 'nationaal'];

export const NIVEAU_LABEL: Record<Niveau, string> = {
  internationaal: 'Internationaal',
  europees: 'Europees',
  nationaal: 'Nationaal',
};

export const NIVEAU_KLEUR: Record<Niveau, string> = {
  internationaal: '#1D4ED8',
  europees: '#0F766E',
  nationaal: '#C2410C',
};

export const STATUSSEN: Status[] = ['concept', 'te_verifieren', 'bevestigd'];

export const STATUS_LABEL: Record<Status, string> = {
  concept: 'Concept',
  te_verifieren: 'Te verifiëren',
  bevestigd: 'Bevestigd',
};

export const NORM_TYPES: NormType[] = ['ISO', 'ISO/IEC', 'EN', 'NEN', 'NEN-EN-ISO', 'NPR', 'NTA', 'Codelijst', 'Overig'];

/** Uitleg bij typen die niet voor zich spreken */
export const NORM_TYPE_UITLEG: Partial<Record<NormType, string>> = {
  NPR: 'Nederlandse Praktijkrichtlijn',
  NTA: 'Nederlandse Technische Afspraak',
};
export const FORMELE_TYPES: NormType[] = ['ISO', 'ISO/IEC', 'EN', 'NEN', 'NEN-EN-ISO'];

export const RELATIE_TYPES: RelatieType[] = ['verwijst_naar', 'neemt_over', 'gebaseerd_op', 'vervangt'];

export const RELATIE_LABEL: Record<RelatieType, string> = {
  verwijst_naar: 'verwijst naar',
  neemt_over: 'neemt over (adoptie)',
  gebaseerd_op: 'is gebaseerd op',
  vervangt: 'vervangt',
};

/** Omgekeerde formulering, gezien vanaf de norm waarnaar verwezen wordt. */
export const RELATIE_LABEL_OMGEKEERD: Record<RelatieType, string> = {
  verwijst_naar: 'wordt gebruikt door',
  neemt_over: 'wordt overgenomen door',
  gebaseerd_op: 'is de basis voor',
  vervangt: 'wordt vervangen door',
};

export const ISO3166_DELEN = ['3166-1 alpha-2', '3166-1 alpha-3', '3166-1 numeriek', '3166-2', '3166-3'];
