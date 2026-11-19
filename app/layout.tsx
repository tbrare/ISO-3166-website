import type { Metadata } from 'next';
import './globals.css';
import { TEKSTEN } from '@/lib/i18n';
import { huidigeTaal } from '@/lib/taal-server';

export async function generateMetadata(): Promise<Metadata> {
  const t = TEKSTEN[await huidigeTaal()];
  return { title: t.metaTitel, description: t.metaOmschrijving };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const taal = await huidigeTaal();
  return (
    <html lang={taal}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
