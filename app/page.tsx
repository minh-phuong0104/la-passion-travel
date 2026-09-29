import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const sfuFutura = localFont({
  src: [
    {
      path: '../public/fonts/SFUFuturaRegular.TTF',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/SFUFuturaBold.TTF',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-sfu-futura',
  display: 'swap',
  fallback: ['Arial', 'Helvetica', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'La Passion Travel',
  description: 'Curated journeys through Vietnam',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={sfuFutura.variable}>
      <body>{children}</body>
    </html>
  );
}
