import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";

import "./globals.css";

import AnalyticsInit from "@/components/AnalyticsInit";

const sfuFutura = localFont({
  src: [
    {
      path: "../public/SFUFuturaRegular.TTF",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/SFUFuturaBold.TTF",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sfu-futura",
  display: "swap",
  fallback: ["Arial", "Helvetica", "sans-serif"],
  preload: true,
});

const site =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(site),

  title:
    "La Passion Travel | Tailor-Made Journeys Through Vietnam",

  description:
    "Discover Vietnam your way with La Passion Travel. Enjoy personalized journeys, local experiences, and expert support.",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "La Passion Travel",
    description:
      "Tailor-made journeys through Vietnam.",
    type: "website",
    locale: "en_US",
  },

  icons: {
    icon: "/images/logo-la-passion.png",
    shortcut: "/images/logo-la-passion.png",
    apple: "/images/logo-la-passion.png",
  },
};

export default function Root({
  children,
}: {
  children: React.ReactNode;
}) {
  const ga =
    process.env.NEXT_PUBLIC_GA_ID;

  const px =
    process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <html
      lang="en"
      className={sfuFutura.variable}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-white font-sans antialiased">
        {children}

        <AnalyticsInit />

        {ga && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
              strategy="afterInteractive"
            />

            <Script
              id="ga"
              strategy="afterInteractive"
            >
              {`
                window.dataLayer = window.dataLayer || [];

                function gtag() {
                  dataLayer.push(arguments);
                }

                window.gtag = gtag;

                gtag('js', new Date());
                gtag('config', '${ga}');
              `}
            </Script>
          </>
        )}

        {px && (
          <Script
            id="px"
            strategy="afterInteractive"
          >
            {`
              !function(f,b,e,v,n,t,s) {
                if(f.fbq) return;

                n = f.fbq = function() {
                  n.callMethod
                    ? n.callMethod.apply(n, arguments)
                    : n.queue.push(arguments);
                };

                if(!f._fbq) f._fbq = n;

                n.push = n;
                n.loaded = !0;
                n.version = '2.0';
                n.queue = [];

                t = b.createElement(e);
                t.async = !0;
                t.src = v;

                s = b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t, s);
              }(
                window,
                document,
                'script',
                'https://connect.facebook.net/en_US/fbevents.js'
              );

              fbq('init', '${px}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
      </body>
    </html>
  );
}
