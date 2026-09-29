import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#083c38] text-white"
      style={{
        backgroundImage: `
          linear-gradient(
            90deg,
            rgba(5, 54, 50, 0.96) 0%,
            rgba(5, 54, 50, 0.82) 35%,
            rgba(5, 54, 50, 0.42) 62%,
            rgba(5, 54, 50, 0.16) 100%
          ),
          url('/images/hero-halong.jpg')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* subtle dark overlay */}
      <div className="pointer-events-none absolute inset-0 bg-black/5" />

      {/* HEADER */}
      <header className="relative z-20 flex items-center justify-between px-7 py-6 md:px-12 lg:px-16 xl:px-20">
        {/* LOGO */}
        <div className="relative h-[82px] w-[250px] md:h-[94px] md:w-[290px] lg:h-[104px] lg:w-[320px]">
          <Image
            src="/images/logo-la-passion.png"
            alt="La Passion Travel"
            fill
            priority
            className="object-contain object-left"
          />
        </div>

        {/* NAVIGATION */}
        <nav className="hidden items-center gap-7 text-[14px] text-white/85 md:flex lg:gap-10">
          <a href="#journey" className="transition hover:text-white">
            Journeys
          </a>

          <a href="#destinations" className="transition hover:text-white">
            Destinations
          </a>

          <a href="#inspiration" className="transition hover:text-white">
            Inspiration
          </a>

          <a href="#about" className="transition hover:text-white">
            About us
          </a>

          <button
            type="button"
            className="flex items-center gap-1 text-white/90"
          >
            <span className="text-sm">🌐</span>
            <span>EN</span>
            <span className="text-[9px]">⌄</span>
          </button>
        </nav>
      </header>

      {/* HERO CONTENT */}
      <section className="relative z-10 flex min-h-[calc(100vh-110px)] items-center px-7 pb-16 md:px-14 lg:px-16 xl:px-20">
        <div className="w-full max-w-[760px] pt-4 md:pt-0">
          {/* EYEBROW */}
          <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.34em] text-[#d4a84e] md:text-[12px]">
            Curated journeys through Vietnam
          </p>

          {/* HEADING */}
          <h1 className="max-w-[760px] font-serif text-[60px] leading-[0.95] tracking-[-0.04em] md:text-[82px] lg:text-[94px]">
            Your Vietnam
            <br />
            begins here.
          </h1>

          {/* DESCRIPTION */}
          <p className="mt-7 max-w-[560px] text-[17px] leading-8 text-white/85 md:text-[18px]">
            More than a trip: stories,
            <br className="hidden md:block" />
            experiences, and moments crafted just for you.
          </p>

          {/* TRUST POINTS */}
          <div className="mt-10 grid max-w-[720px] grid-cols-1 gap-5 sm:grid-cols-3">
            {/* ITEM 1 */}
            <div className="flex items-start gap-4 border-r-white/15 sm:border-r sm:pr-6">
              <div className="mt-[2px] flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d4a84e]/80 text-[#d4a84e]">
                ♙
              </div>

              <p className="text-[14px] leading-6 text-white/85">
                Guided by
                <br />
                local experts
              </p>
            </div>

            {/* ITEM 2 */}
            <div className="flex items-start gap-4 border-r-white/15 sm:border-r sm:px-6">
              <div className="mt-[2px] flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d4a84e]/80 text-[#d4a84e]">
                ✧
              </div>

              <p className="text-[14px] leading-6 text-white/85">
                Personalized itineraries
                <br />
                tailored to your needs
              </p>
            </div>

            {/* ITEM 3 */}
            <div className="flex items-start gap-4 sm:pl-6">
              <div className="mt-[2px] flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d4a84e]/80 text-[#d4a84e]">
                ◇
              </div>

              <p className="text-[14px] leading-6 text-white/85">
                Dedicated support
                <br />
                during and after your trip
              </p>
            </div>
          </div>

          {/* CTA */}
          <Link
            id="journey"
            href="/journey"
            className="ml-5 mt-11 inline-flex min-w-[285px] items-center justify-center gap-4 rounded-[10px] bg-[#d2a34a] px-10 py-[20px] text-[17px] font-semibold text-[#123c36] shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#ddb15c]"
          >
            Start your journey
            <span className="text-[22px]">→</span>
          </Link>
        </div>
      </section>

      {/* SIGNATURE */}
      <div className="pointer-events-none absolute bottom-7 left-8 z-10 hidden rotate-[-7deg] font-serif text-[24px] italic leading-6 text-white/60 md:block lg:left-16 xl:left-20">
        More Vietnam
        <br />
        More You
      </div>

      {/* LOCATION */}
      <div className="absolute bottom-8 right-8 z-10 hidden items-center gap-2 text-[11px] text-white/75 md:flex lg:right-16 xl:right-20">
        <span className="text-[#d4a84e]">●</span>
        Ha Long Bay, Quang Ninh
      </div>
    </main>
  );
}
