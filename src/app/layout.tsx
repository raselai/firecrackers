import type { Metadata } from 'next';
import { Inter, Poppins, Playfair_Display, Manrope } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Navbar from '../components/Navbar';
import { Providers } from '../components/Providers';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins'
});
const playfair = Playfair_Display({
  weight: ['600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-playfair'
});
const manrope = Manrope({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-manrope'
});

export const metadata: Metadata = {
  title: 'BBOOM88',
  description: 'BBOOM88',
};

const googleTagId = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID || 'G-WH72YFZP9B';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {googleTagId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
              strategy="afterInteractive"
            />
            <Script id="google-tag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleTagId}');
              `}
            </Script>
          </>
        ) : null}
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} ${playfair.variable} ${manrope.variable}`}
        suppressHydrationWarning={true}
      >
        <Providers>
          <Navbar />
          <main>
            {children}
          </main>
          <WhatsAppFloat />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

