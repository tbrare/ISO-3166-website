import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'iso3166.nl – Waar wordt ISO 3166 gebruikt?',
  description:
    'Register van internationale, Europese en Nederlandse normen en codelijsten die de landencodes van ISO 3166 gebruiken.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
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
