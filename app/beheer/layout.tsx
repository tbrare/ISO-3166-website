import { redirect } from 'next/navigation';
import { maakServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function BeheerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await maakServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: isBeheerder } = await supabase.rpc('is_beheerder');
  if (!isBeheerder) {
    return (
      <main className="sectie" style={{ paddingTop: 48 }}>
        <div className="kaart" style={{ maxWidth: 560 }}>
          <h1 style={{ marginTop: 0, fontSize: 24 }}>Geen beheerrechten</h1>
          <p>Je bent ingelogd als {user.email}, maar dit account staat niet in de tabel beheerders.</p>
          <form action="/auth/uitloggen" method="post">
            <button type="submit" className="knop">Uitloggen</button>
          </form>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
