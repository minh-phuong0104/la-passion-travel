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
      {/* DARK OVERLAY */}
      <div className="pointer-events-none absolute inset-0 bg-black/5" />

      {/* HEADER */}
      <header
        className="
          relative
          z-20
          flex
          items-center
          px-7
          py-6
          md:px-12
          lg:px-16
          xl:px-20
        "
      >
        {/* LOGO */}
        <div
          className="
            relative
            h-[92px]
            w-[92px]
            shrink-0
            overflow-hidden
            rounded-full
            border
            border-[#d2a34a]/60
            bg-[#123f3a]
            shadow-[0_8px_24px_rgba(0,0,0,0.18)]

            md:h-[104px]
            md:w-[104px]
          "
        >
          <Image
            src="/images/logo-la-passion.png"
            alt="La Passion Travel"
            fill
            priority
            className="object-contain p-3"
          />
        </div>
      </header>

      {/* HERO */}
      <section
        className="
          relative
          z-10
          flex
          min-h-[calc(100vh-110px)]
          items-center
          px-7
          pb-16
          md:px-14
          lg:px-16
          xl:px-20
        "
      >
        <div
          className="
            w-full
            max-w-[820px]
            pt-4
            md:pt-0
          "
        >
          {/* EYEBROW */}
          <p
            className="
              mb-6
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.34em]
              text-[#d4a84e]
              md:text-[12px]
            "
          >
            Curated journeys through Vietnam
          </p>

          {/* HEADING */}
          <h1
            className="
              max-w-[760px]
              text-[60px]
              font-bold
              leading-[0.95]
              tracking-[-0.04em]
              md:text-[82px]
              lg:text-[94px]
            "
          >
            Your Vietnam
            <br />
            begins here
          </h1>

          {/* DESCRIPTION */}
          <p
            className="
              mt-7
              max-w-[560px]
              text-[17px]
              leading-8
              text-white/85
              md:text-[18px]
            "
          >
            More than a trip: stories,
            <br className="hidden md:block" />
            experiences, and moments crafted just for you.
          </p>

          {/* TRUST POINTS */}
          <div
            className="
              mt-10
              grid
              max-w-[720px]
              grid-cols-1
              gap-5
              sm:grid-cols-3
            "
          >
            <div
              className="
                flex
                items-start
                gap-4
                border-r-white/15
                sm:border-r
                sm:pr-6
              "
            >
              <div
                className="
                  mt-[2px]
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#d4a84e]/80
                  text-[#d4a84e]
                "
              >
                ♙
              </div>

              <p className="text-[14px] leading-6 text-white/85">
                Guided by
                <br />
                local experts
              </p>
            </div>

            <div
              className="
                flex
                items-start
                gap-4
                border-r-white/15
                sm:border-r
                sm:px-6
              "
            >
              <div
                className="
                  mt-[2px]
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#d4a84e]/80
                  text-[#d4a84e]
                "
              >
                ✧
              </div>

              <p className="text-[14px] leading-6 text-white/85">
                Personalized itineraries
                <br />
                tailored to your needs
              </p>
            </div>

            <div
              className="
                flex
                items-start
                gap-4
                sm:pl-6
              "
            >
              <div
                className="
                  mt-[2px]
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#d4a84e]/80
                  text-[#d4a84e]
                "
              >
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
          <div
            className="
              mt-12
              flex
              w-full
              justify-center
              md:justify-end
            "
          >
            <Link
              id="journey"
              href="/journey"
              className="
                group
                inline-flex
                min-w-[320px]
                items-center
                justify-center
                gap-5
                rounded-[14px]
                border
                border-[#ecc879]/30
                bg-[#d2a34a]
                px-10
                py-[22px]
                text-[19px]
                font-bold
                text-[#123c36]
                shadow-[0_18px_45px_rgba(0,0,0,0.28)]
                transition
                duration-200

                hover:-translate-y-1
                hover:scale-[1.03]
                hover:bg-[#e0b45d]
                hover:shadow-[0_24px_55px_rgba(0,0,0,0.35)]

                sm:min-w-[340px]
                sm:px-12
                sm:py-[24px]
                sm:text-[20px]

                md:min-w-[390px]
                md:text-[22px]
              "
            >
              Start your journey

              <span
                className="
                  text-[28px]
                  transition
                  duration-200
                  group-hover:translate-x-2
                "
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* SIGNATURE */}
      <div
        className="
          pointer-events-none
          absolute
          bottom-7
          left-8
          z-10
          hidden
          rotate-[-7deg]
          text-[24px]
          font-bold
          italic
          leading-6
          text-white/60

          md:block
          lg:left-16
          xl:left-20
        "
      >
        More Vietnam
        <br />
        More You
      </div>

      {/* LOCATION */}
      <div
        className="
          absolute
          bottom-8
          right-8
          z-10
          hidden
          items-center
          gap-2
          text-[11px]
          text-white/75

          md:flex
          lg:right-16
          xl:right-20
        "
      >
        <span className="text-[#d4a84e]">●</span>
        Ha Long Bay, Quang Ninh
      </div>
    </main>
  );
}
