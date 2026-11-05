import Link from 'next/link';
import SiteKop from '@/components/SiteKop';

export const metadata = {
  title: 'Over ISO 3166 – iso3166.nl',
  description: 'Wat is ISO 3166, uit welke delen bestaat de norm en hoe werkt het register op iso3166.nl?',
};

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
            <p>
              Codes voor landen en gebieden, in drie vormen: alpha-2 <b className="mono">NL</b>, alpha-3 <b className="mono">NLD</b>{' '}
              en numeriek <b className="mono">528</b>.
            </p>
          </div>
          <div className="codekaart">
            <p className="bovenregel" style={{ margin: 0 }}>ISO 3166-2</p>
            <p>
              Codes voor onderverdelingen, zoals provincies: <b className="mono">NL-UT</b> voor Utrecht en <b className="mono">NL-GR</b>{' '}
              voor Groningen.
            </p>
          </div>
          <div className="codekaart">
            <p className="bovenregel" style={{ margin: 0 }}>ISO 3166-3</p>
            <p>Codes voor vervallen landnamen, zoals Joegoslavië en de Nederlandse Antillen.</p>
          </div>
        </div>

        <h2>Het Koninkrijk der Nederlanden in ISO 3166-1</h2>
        <p>Het Koninkrijk heeft meerdere codes, omdat de landen en de Caribische openbare lichamen afzonderlijk worden gecodeerd.</p>
        <div style={{ overflowX: 'auto' }}>
          <table className="voorbeeldtabel">
            <thead>
              <tr>
                <th scope="col">Gebied</th>
                <th scope="col">Alpha-2</th>
                <th scope="col">Alpha-3</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Nederland</td><td className="mono">NL</td><td className="mono">NLD</td></tr>
              <tr><td>Aruba</td><td className="mono">AW</td><td className="mono">ABW</td></tr>
              <tr><td>Curaçao</td><td className="mono">CW</td><td className="mono">CUW</td></tr>
              <tr><td>Sint Maarten</td><td className="mono">SX</td><td className="mono">SXM</td></tr>
              <tr><td>Bonaire, Sint Eustatius en Saba</td><td className="mono">BQ</td><td className="mono">BES</td></tr>
            </tbody>
          </table>
        </div>

        <h2>Waarom dit register?</h2>
        <p>
          Wie een landcode wijzigt of een nieuwe norm opstelt, wil weten welke andere normen en systemen afhankelijk zijn van
          ISO 3166. Die afhankelijkheden zijn nergens centraal vastgelegd. Dit register brengt ze in beeld: welke internationale,
          Europese en Nederlandse normen en codelijsten ISO 3166 gebruiken, in welke toepassingsdomeinen, en hoe ze op elkaar voortbouwen.
        </p>

        <h2>Hoe lees je het spinnenweb?</h2>
        <ul>
          <li>In het midden staat ISO 3166. Daaromheen liggen de toepassingsdomeinen, zoals de bancaire sector of persoonsgegevens.</li>
          <li>Vanuit elk domein waaieren de normen uit die ISO 3166 in dat domein gebruiken.</li>
          <li>
            De kleur geeft het niveau aan: blauw is internationaal, groen Europees en oranje nationaal. Een rond bolletje is een formele
            norm, een vierkant een codelijst of andere standaard.
          </li>
          <li>
            Een norm die naar een andere norm verwijst, ligt in het verlengde daarvan. Valt hij onder een ander domein, dan staat hij
            daar ook, en bij de verwijzing wordt hij herhaald met een gestippeld kader.
          </li>
          <li>Een gestippelde lijn betekent dat een norm ISO 3166 niet zelf noemt, maar er via een andere norm wel van afhankelijk is.</li>
        </ul>
        <p>Alleen bevestigde gegevens worden getoond.</p>

        <p style={{ marginTop: 40 }}>
          <Link href="/" style={{ fontWeight: 600 }}>Naar het spinnenweb →</Link>
        </p>
      </main>
      <footer className="voet">
        iso3166.nl · Open data: <a href="/api/normen">/api/normen</a> (JSON)
      </footer>
    </>
  );
}
