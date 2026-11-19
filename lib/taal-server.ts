import { cookies } from 'next/headers';
import { isTaal, TAAL_COOKIE, type Taal } from './i18n';

/** Taal van de bezoeker, uit de cookie. Standaard Nederlands. */
export async function huidigeTaal(): Promise<Taal> {
  const waarde = (await cookies()).get(TAAL_COOKIE)?.value;
  return isTaal(waarde) ? waarde : 'nl';
}
