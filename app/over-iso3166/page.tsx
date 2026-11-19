import type { Metadata } from 'next';
import Link from 'next/link';
import SiteKop from '@/components/SiteKop';
import SiteVoet from '@/components/SiteVoet';
import type { Taal } from '@/lib/i18n';
import { huidigeTaal } from '@/lib/taal-server';

const INHOUD = {
  nl: {
    metaTitel: 'Over ISO 3166 – ISO 3166 Landencodes',
    metaOmschrijving: 'Wat is ISO 3166, uit welke delen bestaat de norm en welke codes heeft het Koninkrijk der Nederlanden?',
    bovenregel: 'Achtergrond',
    kop: 'Over ISO 3166',
    lead: 'ISO 3166 is de internationale norm voor codes van landen en hun onderverdelingen. Vrijwel elk systeem dat met landen werkt — van betalingsverkeer en paspoorten tot e-facturen en basisregistraties — leunt erop, vaak zonder dat het opvalt.',
    delenKop: 'De drie delen van de norm',
    deel1: 'Codes voor landen en gebieden, in drie vormen: twee letters, drie letters en drie cijfers.',
    deel2: 'Codes voor de onderverdelingen van een land, zoals provincies.',
    deel3: 'Codes voor landnamen die uit ISO 3166-1 zijn verwijderd, met hun opvolgers.',
    koninkrijkKop: 'Het Koninkrijk der Nederlanden in ISO 3166',
    koninkrijkTekst: 'Het Koninkrijk bestaat uit vier landen: Nederland, Aruba, Curaçao en Sint Maarten. Bonaire, Sint Eustatius en Saba zijn bijzondere gemeenten van Nederland. In ISO 3166 krijgen ze allemaal een eigen code.',
    k1: 'ISO 3166-1 — landcodes',
    gebied: 'Gebied',
    numeriek: 'Numeriek',
    nederland: 'Nederland',
    bes: 'Bonaire, Sint Eustatius en Saba',
    k2a: 'ISO 3166-2 — provincies',
    code: 'Code',
    provincie: 'Provincie',
    k2b: 'ISO 3166-2 — landen en bijzondere gemeenten in het Caribisch deel',
    k2bTekst: 'Deze gebieden hebben een ISO 3166-2-code onder Nederland én een eigen landcode in ISO 3166-1.',
    naam: 'Naam',
    soort: 'Soort',
    land: 'land',
    bijzondereGemeente: 'bijzondere gemeente',
    ook: 'ook',
    k3: 'ISO 3166-3 — vervallen codes',
    voormalig: 'Voormalig gebied',
    oudeCodes: 'Oude codes',
    geldig: 'Geldig',
    opgevolgd: 'Opgevolgd door',
    antillen: 'Nederlandse Antillen',
    curacao: 'Curaçao',
    noot: 'Toen Aruba in 1986 uit de Nederlandse Antillen trad, veranderde de numerieke code van de Antillen van 532 in 530.',
    bronTekst: 'Bron:',
    bronNa: 'Raadpleeg daar altijd de actuele stand.',
    waaromKop: 'Waarom dit register?',
    waaromTekst: 'Wie een landcode wijzigt of een nieuwe norm opstelt, wil weten welke andere normen en systemen afhankelijk zijn van ISO 3166. Die afhankelijkheden zijn nergens centraal vastgelegd. Dit register brengt ze in beeld: welke internationale, Europese en Nederlandse normen en codelijsten ISO 3166 gebruiken, in welke toepassingsdomeinen, en hoe ze op elkaar voortbouwen.',
    naarKaart: 'Naar de netwerkkaart →',
  },
  en: {
    metaTitel: 'About ISO 3166 – ISO 3166 Country Codes',
    metaOmschrijving: 'What is ISO 3166, which parts does the standard have, and which codes does the Kingdom of the Netherlands have?',
    bovenregel: 'Background',
    kop: 'About ISO 3166',
    lead: 'ISO 3166 is the international standard for codes of countries and their subdivisions. Almost every system that deals with countries — from payments and passports to e-invoices and base registers — relies on it, often without anyone noticing.',
    delenKop: 'The three parts of the standard',
    deel1: 'Codes for countries and territories, in three forms: two letters, three letters and three digits.',
    deel2: 'Codes for the subdivisions of a country, such as provinces.',
    deel3: 'Codes for country names that have been removed from ISO 3166-1, with their successors.',
    koninkrijkKop: 'The Kingdom of the Netherlands in ISO 3166',
    koninkrijkTekst: 'The Kingdom consists of four countries: the Netherlands, Aruba, Curaçao and Sint Maarten. Bonaire, Sint Eustatius and Saba are special municipalities of the Netherlands. In ISO 3166 each of them has its own code.',
    k1: 'ISO 3166-1 — country codes',
    gebied: 'Territory',
    numeriek: 'Numeric',
    nederland: 'Netherlands',
    bes: 'Bonaire, Sint Eustatius and Saba',
    k2a: 'ISO 3166-2 — provinces',
    code: 'Code',
    provincie: 'Province',
    k2b: 'ISO 3166-2 — countries and special municipalities in the Caribbean part',
    k2bTekst: 'These territories have an ISO 3166-2 code under the Netherlands as well as their own country code in ISO 3166-1.',
    naam: 'Name',
    soort: 'Category',
    land: 'country',
    bijzondereGemeente: 'special municipality',
    ook: 'also',
    k3: 'ISO 3166-3 — withdrawn codes',
    voormalig: 'Former territory',
    oudeCodes: 'Former codes',
    geldig: 'Valid',
    opgevolgd: 'Succeeded by',
    antillen: 'Netherlands Antilles',
    curacao: 'Curaçao',
    noot: 'When Aruba left the Netherlands Antilles in 1986, the numeric code of the Antilles changed from 532 to 530.',
    bronTekst: 'Source:',
    bronNa: 'Always check the current status there.',
    waaromKop: 'Why this register?',
    waaromTekst: 'Anyone changing a country code or drafting a new standard needs to know which other standards and systems depend on ISO 3166. Those dependencies are not recorded in one place. This register maps them: which international, European and Dutch standards and code lists use ISO 3166, in which application domains, and how they build on each other.',
    naarKaart: 'Go to the network map →',
  },
};

const provincies: [string, string][] = [
  ['NL-DR', 'Drenthe'],
  ['NL-FL', 'Flevoland'],
  ['NL-FR', 'Fryslân'],
  ['NL-GE', 'Gelderland'],
  ['NL-GR', 'Groningen'],
  ['NL-LI', 'Limburg'],
  ['NL-NB', 'Noord-Brabant'],
  ['NL-NH', 'Noord-Holland'],
  ['NL-OV', 'Overijssel'],
  ['NL-UT', 'Utrecht'],
  ['NL-ZE', 'Zeeland'],
  ['NL-ZH', 'Zuid-Holland'],
];

export async function generateMetadata(): Promise<Metadata> {
  const c = INHOUD[await huidigeTaal()];
  return { title: c.metaTitel, description: c.metaOmschrijving };
}

export default async function OverIso3166() {
  const taal: Taal = await huidigeTaal();
  const c = INHOUD[taal];

  const caribisch: [string, string, string, string][] = [
    ['NL-AW', 'Aruba', c.land, 'AW'],
    ['NL-CW', c.curacao, c.land, 'CW'],
    ['NL-SX', 'Sint Maarten', c.land, 'SX'],
    ['NL-BQ1', 'Bonaire', c.bijzondereGemeente, `BQ (${c.ook} BQ-BO)`],
    ['NL-BQ2', 'Saba', c.bijzondereGemeente, `BQ (${c.ook} BQ-SA)`],
    ['NL-BQ3', 'Sint Eustatius', c.bijzondereGemeente, `BQ (${c.ook} BQ-SE)`],
  ];

  return (
    <>
      <SiteKop actief="over" taal={taal} />
      <main className="tekst-pagina">
        <p className="bovenregel">{c.bovenregel}</p>
        <h1>{c.kop}</h1>
        <p className="lead">{c.lead}</p>

        <h2>{c.delenKop}</h2>
        <div className="codes">
          <div className="codekaart">
            <p className="bovenregel" style={{ margin: 0 }}>ISO 3166-1</p>
            <p>{c.deel1}</p>
          </div>
          <div className="codekaart">
            <p className="bovenregel" style={{ margin: 0 }}>ISO 3166-2</p>
            <p>{c.deel2}</p>
          </div>
          <div className="codekaart">
            <p className="bovenregel" style={{ margin: 0 }}>ISO 3166-3</p>
            <p>{c.deel3}</p>
          </div>
        </div>

        <h2>{c.koninkrijkKop}</h2>
        <p>{c.koninkrijkTekst}</p>

        <h3>{c.k1}</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="voorbeeldtabel">
            <thead>
              <tr>
                <th scope="col">{c.gebied}</th>
                <th scope="col">Alpha-2</th>
                <th scope="col">Alpha-3</th>
                <th scope="col">{c.numeriek}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>{c.nederland}</td><td className="mono">NL</td><td className="mono">NLD</td><td className="mono">528</td></tr>
              <tr><td>Aruba</td><td className="mono">AW</td><td className="mono">ABW</td><td className="mono">533</td></tr>
              <tr><td>{c.curacao}</td><td className="mono">CW</td><td className="mono">CUW</td><td className="mono">531</td></tr>
              <tr><td>Sint Maarten</td><td className="mono">SX</td><td className="mono">SXM</td><td className="mono">534</td></tr>
              <tr><td>{c.bes}</td><td className="mono">BQ</td><td className="mono">BES</td><td className="mono">535</td></tr>
            </tbody>
          </table>
        </div>

        <h3>{c.k2a}</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="voorbeeldtabel">
            <thead>
              <tr>
                <th scope="col">{c.code}</th>
                <th scope="col">{c.provincie}</th>
              </tr>
            </thead>
            <tbody>
              {provincies.map(([code, naam]) => (
                <tr key={code}><td className="mono">{code}</td><td lang="nl">{naam}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3>{c.k2b}</h3>
        <p>{c.k2bTekst}</p>
        <div style={{ overflowX: 'auto' }}>
          <table className="voorbeeldtabel">
            <thead>
              <tr>
                <th scope="col">{c.code}</th>
                <th scope="col">{c.naam}</th>
                <th scope="col">{c.soort}</th>
                <th scope="col">ISO 3166-1</th>
              </tr>
            </thead>
            <tbody>
              {caribisch.map(([code, naam, soort, eigen]) => (
                <tr key={code}><td className="mono">{code}</td><td>{naam}</td><td>{soort}</td><td className="mono">{eigen}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3>{c.k3}</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="voorbeeldtabel">
            <thead>
              <tr>
                <th scope="col">{c.voormalig}</th>
                <th scope="col">{c.oudeCodes}</th>
                <th scope="col">{c.geldig}</th>
                <th scope="col">ISO 3166-3</th>
                <th scope="col">{c.opgevolgd}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{c.antillen}</td>
                <td className="mono">AN, ANT, 530</td>
                <td>1974–2010</td>
                <td className="mono">ANHH</td>
                <td>
                  {c.bes} (<span className="mono">BQ</span>), {c.curacao} (<span className="mono">CW</span>), Sint Maarten (<span className="mono">SX</span>)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="bron">{c.noot}</p>
        <p className="bron">
          {c.bronTekst}{' '}
          <a href="https://www.iso.org/obp/ui/#iso:code:3166:NL" target="_blank" rel="noopener noreferrer">ISO Online Browsing Platform</a>. {c.bronNa}
        </p>

        <h2>{c.waaromKop}</h2>
        <p>{c.waaromTekst}</p>

        <p style={{ marginTop: 40 }}>
          <Link href="/" style={{ fontWeight: 600 }}>{c.naarKaart}</Link>
        </p>
      </main>
      <SiteVoet taal={taal} />
    </>
  );
}
