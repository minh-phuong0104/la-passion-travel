import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

const sfuFutura = localFont({
  src: [
    {
      path: "../public/fonts/SFUFuturaRegular.TTF",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/SFUFuturaBold.TTF",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sfu-futura",
  display: "swap",
  fallback: [
    "Arial",
    "Helvetica",
    "sans-serif",
  ],
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "La Passion Travel",
    template: "%s | La Passion Travel",
  },

  description:
    "Curated journeys through Vietnam, designed around the way you want to travel.",

  applicationName:
    "La Passion Travel",

  keywords: [
    "Vietnam travel",
    "Vietnam itinerary",
    "Vietnam tour",
    "La Passion Travel",
    "custom Vietnam journey",
  ],

  authors: [
    {
      name: "La Passion Travel",
    },
  ],

  creator: "La Passion Travel",
  publisher: "La Passion Travel",

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/images/logo-la-passion.png",
    shortcut:
      "/images/logo-la-passion.png",
    apple:
      "/images/logo-la-passion.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={
        sfuFutura.variable
      }
    >
      <body
        className="
          min-h-screen
          bg-white
          font-sans
          antialiased
        "
      >
        {children}
      </body>
    </html>
  );
}
