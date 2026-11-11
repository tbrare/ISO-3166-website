import Link from 'next/link';
import SiteKop from '@/components/SiteKop';

export const metadata = {
  title: 'Over ISO 3166 – iso3166.nl',
  description: 'Wat is ISO 3166, uit welke delen bestaat de norm en welke codes heeft het Koninkrijk der Nederlanden?',
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

const caribisch: [string, string, string, string][] = [
  ['NL-AW', 'Aruba', 'land', 'AW'],
  ['NL-CW', 'Curaçao', 'land', 'CW'],
  ['NL-SX', 'Sint Maarten', 'land', 'SX'],
  ['NL-BQ1', 'Bonaire', 'bijzondere gemeente', 'BQ (ook BQ-BO)'],
  ['NL-BQ2', 'Saba', 'bijzondere gemeente', 'BQ (ook BQ-SA)'],
  ['NL-BQ3', 'Sint Eustatius', 'bijzondere gemeente', 'BQ (ook BQ-SE)'],
];

export default function OverIso3166() {
  return (
    <>
      <SiteKop actief="over" />
      <main className="tekst-pagina">
        <p className="bovenregel">Achtergrond</p>
        <h1>Over ISO 3166</h1>
        <p className="lead">
          ISO 3166 is de internationale norm voor codes van landen en hun onderverdelingen. Vrijwel elk systeem dat met landen
          werkt — van betalingsverkeer en paspoorten tot e-facturen en basisregistraties — leunt erop, vaak zonder dat het opvalt.
        </p>

        <h2>De drie delen van de norm</h2>
        <div className="codes">
          <div className="codekaart">
            <p className="bovenregel" style={{ margin: 0 }}>ISO 3166-1</p>
            <p>Codes voor landen en gebieden, in drie vormen: twee letters, drie letters en drie cijfers.</p>
          </div>
          <div className="codekaart">
            <p className="bovenregel" style={{ margin: 0 }}>ISO 3166-2</p>
            <p>Codes voor de onderverdelingen van een land, zoals provincies.</p>
          </div>
          <div className="codekaart">
            <p className="bovenregel" style={{ margin: 0 }}>ISO 3166-3</p>
            <p>Codes voor landnamen die uit ISO 3166-1 zijn verwijderd, met hun opvolgers.</p>
          </div>
        </div>

        <h2>Het Koninkrijk der Nederlanden in ISO 3166</h2>
        <p>
          Het Koninkrijk bestaat uit vier landen: Nederland, Aruba, Curaçao en Sint Maarten. Bonaire, Sint Eustatius en Saba zijn
          bijzondere gemeenten van Nederland. In ISO 3166 krijgen ze allemaal een eigen code.
        </p>

        <h3>ISO 3166-1 — landcodes</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="voorbeeldtabel">
            <thead>
              <tr>
                <th scope="col">Gebied</th>
                <th scope="col">Alpha-2</th>
                <th scope="col">Alpha-3</th>
                <th scope="col">Numeriek</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Nederland</td><td className="mono">NL</td><td className="mono">NLD</td><td className="mono">528</td></tr>
              <tr><td>Aruba</td><td className="mono">AW</td><td className="mono">ABW</td><td className="mono">533</td></tr>
              <tr><td>Curaçao</td><td className="mono">CW</td><td className="mono">CUW</td><td className="mono">531</td></tr>
              <tr><td>Sint Maarten</td><td className="mono">SX</td><td className="mono">SXM</td><td className="mono">534</td></tr>
              <tr><td>Bonaire, Sint Eustatius en Saba</td><td className="mono">BQ</td><td className="mono">BES</td><td className="mono">535</td></tr>
            </tbody>
          </table>
        </div>

        <h3>ISO 3166-2 — provincies</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="voorbeeldtabel">
            <thead>
              <tr>
                <th scope="col">Code</th>
                <th scope="col">Provincie</th>
              </tr>
            </thead>
            <tbody>
              {provincies.map(([code, naam]) => (
                <tr key={code}><td className="mono">{code}</td><td>{naam}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3>ISO 3166-2 — landen en bijzondere gemeenten in het Caribisch deel</h3>
        <p>Deze gebieden hebben een ISO 3166-2-code onder Nederland én een eigen landcode in ISO 3166-1.</p>
        <div style={{ overflowX: 'auto' }}>
          <table className="voorbeeldtabel">
            <thead>
              <tr>
                <th scope="col">Code</th>
                <th scope="col">Naam</th>
                <th scope="col">Soort</th>
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

        <h3>ISO 3166-3 — vervallen codes</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="voorbeeldtabel">
            <thead>
              <tr>
                <th scope="col">Voormalig gebied</th>
                <th scope="col">Oude codes</th>
                <th scope="col">Geldig</th>
                <th scope="col">ISO 3166-3</th>
                <th scope="col">Opgevolgd door</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Nederlandse Antillen</td>
                <td className="mono">AN, ANT, 530</td>
                <td>1974–2010</td>
                <td className="mono">ANHH</td>
                <td>Bonaire, Sint Eustatius en Saba (<span className="mono">BQ</span>), Curaçao (<span className="mono">CW</span>), Sint Maarten (<span className="mono">SX</span>)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="bron">
          Toen Aruba in 1986 uit de Nederlandse Antillen trad, veranderde de numerieke code van de Antillen van 532 in 530.
        </p>

        <p className="bron">
          Bron: <a href="https://www.iso.org/obp/ui/#iso:code:3166:NL" target="_blank" rel="noopener noreferrer">ISO Online Browsing Platform</a>.
          Raadpleeg daar altijd de actuele stand.
        </p>

        <h2>Waarom dit register?</h2>
        <p>
          Wie een landcode wijzigt of een nieuwe norm opstelt, wil weten welke andere normen en systemen afhankelijk zijn van
          ISO 3166. Die afhankelijkheden zijn nergens centraal vastgelegd. Dit register brengt ze in beeld: welke internationale,
          Europese en Nederlandse normen en codelijsten ISO 3166 gebruiken, in welke toepassingsdomeinen, en hoe ze op elkaar voortbouwen.
        </p>

        <p style={{ marginTop: 40 }}>
          <Link href="/" style={{ fontWeight: 600 }}>Naar de netwerkkaart →</Link>
        </p>
      </main>
      <footer className="voet">
        iso3166.nl · Open data: <a href="/api/normen">/api/normen</a> (JSON)
      </footer>
    </>
  );
}
