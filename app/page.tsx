import SiteKop from '@/components/SiteKop';
import SiteVoet from '@/components/SiteVoet';
import RegisterWeergave from '@/components/RegisterWeergave';
import { haalRegisterOp } from '@/lib/data';
import { TEKSTEN } from '@/lib/i18n';
import { huidigeTaal } from '@/lib/taal-server';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const taal = await huidigeTaal();
  const t = TEKSTEN[taal];
  const { domeinen, normen, relaties, fout } = await haalRegisterOp({ alleenBevestigd: true, taal });

  return (
    <>
      <SiteKop actief="web" taal={taal} />
      {fout && (
        <div className="sectie">
          <p className="foutmelding" role="alert">{t.laadFout} {fout}</p>
        </div>
      )}
      <main>
        {/* key: bij een taalwissel opnieuw opbouwen met de vertaalde gegevens */}
        <RegisterWeergave key={taal} domeinen={domeinen} normen={normen} relaties={relaties} taal={taal} />
      </main>
      <SiteVoet taal={taal} />
    </>
  );
}
