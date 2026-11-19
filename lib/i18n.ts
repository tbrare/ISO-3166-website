import type { Niveau, NormType, RelatieType } from './types';

export type Taal = 'nl' | 'en';
export const TALEN: Taal[] = ['nl', 'en'];
export const TAAL_COOKIE = 'taal';

export const isTaal = (v: unknown): v is Taal => v === 'nl' || v === 'en';

/** Alle vaste teksten van de publieke site, per taal. */
export const TEKSTEN = {
  nl: {
    siteNaam: 'ISO 3166 Landencodes',
    menuKaart: 'Netwerkkaart',
    menuOver: 'Over ISO 3166',
    hoofdmenu: 'Hoofdmenu',
    taalKeuze: 'Taal',
    beheer: 'Beheer',
    openData: 'Open data',

    metaTitel: 'ISO 3166 Landencodes – Waar wordt ISO 3166 gebruikt?',
    metaOmschrijving:
      'Register van internationale, Europese en Nederlandse normen en codelijsten die de landencodes van ISO 3166 gebruiken.',
    laadFout: 'De gegevens konden niet worden geladen:',

    bovenregel: 'ISO 3166 · landencodes in de praktijk',
    kop: 'Waar wordt ISO 3166 gebruikt?',
    intro:
      'Landencodes lijken een detail, maar betalingsverkeer, reisdocumenten, e-facturatie en basisregistraties zijn ervan afhankelijk. Dit register laat zien welke normen en codelijsten ISO 3166 gebruiken, welke organisaties ermee werken en hoe die normen naar elkaar verwijzen.',
    cijferNormen: 'normen en codelijsten',
    cijferOrganisaties: 'organisaties',
    cijferRelaties: 'directe relaties tussen normen',
    cijferDomeinen: 'toepassingsdomeinen',

    kaartTitel: 'Netwerkkaart',
    filterNiveau: 'Filter op niveau',
    filterSoort: 'Filter op soort',
    alleNiveaus: 'Alle niveaus',
    alleSoorten: 'Alle soorten',
    formeleNormen: 'Formele normen',
    informeel: 'Informeel',
    kaartUitleg:
      'Vanuit ISO 3166 vertakt de kaart naar de toepassingsdomeinen, en vanuit elk domein naar de normen die er gebruik van maken. Klik op een domein om alleen die waaier te tonen, of op een norm voor details. Een norm die naar een andere norm verwijst, ligt in het verlengde daarvan.',
    alleenDomein: 'Alleen domein',
    toonAlleDomeinen: 'Toon alle domeinen',
    legFormeel: 'Formele norm',
    legInformeel: 'Informeel (NPR, NTA, codelijst, standaard)',
    legLijn: 'Lijn tussen normen: de buitenste norm verwijst naar of bouwt voort op de binnenste',
    legIndirect: 'Gebruikt ISO 3166 indirect, via een andere norm',
    legKopie: 'Herhaald als verwijzing (hoofddomein elders)',

    kaartAria:
      'Netwerkkaart: ISO 3166 in het midden, daaromheen de domeinen, per domein de normen die ISO 3166 gebruiken, en normen die daarop voortbouwen in het verlengde',
    domeinAria: (naam: string, aantal: number, actief: boolean) =>
      `Domein ${naam}, ${aantal} normen. ${actief ? 'Klik om alle domeinen te tonen.' : 'Klik om alleen dit domein te tonen.'}`,
    kopieAria: ' (verwijzing; hoofddomein elders)',
    landencodes: 'landencodes',

    formeleNorm: 'Formele norm',
    waaromBeleid: 'Waarom relevant voor beleid',
    nietBeschreven: 'Nog niet beschreven.',
    afkorting: 'Afkorting',
    jaartal: 'Jaartal (editie)',
    toepassing: 'Toepassing',
    organisaties: 'Organisaties',
    domeinen: 'Domeinen',
    gebruikIso: 'Gebruik van ISO 3166',
    direct: 'Direct: de norm verwijst zelf naar ISO 3166',
    indirect: 'Indirect',
    via: 'via',
    directeRelaties: 'Directe relaties',
    geenRelaties: 'Geen directe relaties vastgelegd',
    technisch: 'Technische details',
    type: 'Type',
    gebruiktDeel: 'Gebruikt deel van ISO 3166',
    verwijzingenIso: 'Verwijzingen naar ISO 3166',
    waarInNorm: 'Waar in de norm',
    afwijkingen: 'Afwijkingen van ISO 3166',
    editie: 'Verwijst naar editie',
    bron: 'Bron',
    geenNormen: 'Er zijn nog geen normen gepubliceerd.',

    niveau: { internationaal: 'Internationaal', europees: 'Europees', nationaal: 'Nationaal' } as Record<Niveau, string>,
    relatie: {
      verwijst_naar: 'verwijst naar',
      neemt_over: 'neemt over (adoptie)',
      gebaseerd_op: 'is gebaseerd op',
      vervangt: 'vervangt',
    } as Record<RelatieType, string>,
    relatieOmgekeerd: {
      verwijst_naar: 'wordt gebruikt door',
      neemt_over: 'wordt overgenomen door',
      gebaseerd_op: 'is de basis voor',
      vervangt: 'wordt vervangen door',
    } as Record<RelatieType, string>,
    typeUitleg: { NPR: 'Nederlandse Praktijkrichtlijn', NTA: 'Nederlandse Technische Afspraak' } as Partial<Record<NormType, string>>,
  },

  en: {
    siteNaam: 'ISO 3166 Country Codes',
    menuKaart: 'Network map',
    menuOver: 'About ISO 3166',
    hoofdmenu: 'Main menu',
    taalKeuze: 'Language',
    beheer: 'Admin',
    openData: 'Open data',

    metaTitel: 'ISO 3166 Country Codes – Where is ISO 3166 used?',
    metaOmschrijving:
      'Register of international, European and Dutch standards and code lists that use the ISO 3166 country codes.',
    laadFout: 'The data could not be loaded:',

    bovenregel: 'ISO 3166 · country codes in practice',
    kop: 'Where is ISO 3166 used?',
    intro:
      'Country codes may seem like a detail, but payments, travel documents, e-invoicing and base registers all depend on them. This register shows which standards and code lists use ISO 3166, which organisations work with them, and how those standards refer to each other.',
    cijferNormen: 'standards and code lists',
    cijferOrganisaties: 'organisations',
    cijferRelaties: 'direct relations between standards',
    cijferDomeinen: 'application domains',

    kaartTitel: 'Network map',
    filterNiveau: 'Filter by level',
    filterSoort: 'Filter by kind',
    alleNiveaus: 'All levels',
    alleSoorten: 'All kinds',
    formeleNormen: 'Formal standards',
    informeel: 'Informal',
    kaartUitleg:
      'From ISO 3166 the map branches out to the application domains, and from each domain to the standards that use it. Click a domain to show only that branch, or a standard for details. A standard that refers to another standard sits in line with it.',
    alleenDomein: 'Only domain',
    toonAlleDomeinen: 'Show all domains',
    legFormeel: 'Formal standard',
    legInformeel: 'Informal (NPR, NTA, code list, standard)',
    legLijn: 'Line between standards: the outer standard refers to or builds on the inner one',
    legIndirect: 'Uses ISO 3166 indirectly, through another standard',
    legKopie: 'Repeated as a reference (main domain elsewhere)',

    kaartAria:
      'Network map: ISO 3166 in the centre, the domains around it, the standards that use ISO 3166 per domain, and standards that build on them further out',
    domeinAria: (naam: string, aantal: number, actief: boolean) =>
      `Domain ${naam}, ${aantal} standards. ${actief ? 'Click to show all domains.' : 'Click to show only this domain.'}`,
    kopieAria: ' (reference; main domain elsewhere)',
    landencodes: 'country codes',

    formeleNorm: 'Formal standard',
    waaromBeleid: 'Why it matters for policy',
    nietBeschreven: 'Not yet described.',
    afkorting: 'Abbreviation',
    jaartal: 'Year (edition)',
    toepassing: 'Application',
    organisaties: 'Organisations',
    domeinen: 'Domains',
    gebruikIso: 'Use of ISO 3166',
    direct: 'Direct: the standard itself refers to ISO 3166',
    indirect: 'Indirect',
    via: 'through',
    directeRelaties: 'Direct relations',
    geenRelaties: 'No direct relations recorded',
    technisch: 'Technical details',
    type: 'Type',
    gebruiktDeel: 'Part of ISO 3166 used',
    verwijzingenIso: 'References to ISO 3166',
    waarInNorm: 'Where in the standard',
    afwijkingen: 'Deviations from ISO 3166',
    editie: 'Refers to edition',
    bron: 'Source',
    geenNormen: 'No standards have been published yet.',

    niveau: { internationaal: 'International', europees: 'European', nationaal: 'National' } as Record<Niveau, string>,
    relatie: {
      verwijst_naar: 'refers to',
      neemt_over: 'adopts',
      gebaseerd_op: 'is based on',
      vervangt: 'replaces',
    } as Record<RelatieType, string>,
    relatieOmgekeerd: {
      verwijst_naar: 'is used by',
      neemt_over: 'is adopted by',
      gebaseerd_op: 'is the basis for',
      vervangt: 'is replaced by',
    } as Record<RelatieType, string>,
    typeUitleg: { NPR: 'Dutch Practice Guideline', NTA: 'Dutch Technical Agreement' } as Partial<Record<NormType, string>>,
  },
};

export type Teksten = (typeof TEKSTEN)['nl'];
