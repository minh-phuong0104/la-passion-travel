import Link from 'next/link';
import { IMAGES } from '@/lib/journey-config';

export default function ThankYou() {
  return (
    <main
      className="grid min-h-[100dvh] place-items-center px-6 text-center text-white"
      style={{ background: IMAGES.hero }}
    >
      <div className="max-w-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
          La Passion Travel
        </p>

        <h1 className="mt-5 font-serif text-5xl leading-[1.02] sm:text-6xl">
          Thank you.
          <br />
          Your journey
          <br />
          starts here.
        </h1>

        <p className="mt-6 text-white/85">
          We will be in touch soon with journey ideas tailored to your story.
        </p>

        <p className="mt-3 text-white/85">
          Need another itinerary for a different traveler or trip?
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/journey"
            className="inline-flex items-center justify-center rounded-xl bg-[#d2a34a] px-7 py-3.5 font-semibold text-[#123c36] transition hover:bg-[#ddb15c]"
          >
            Start a new journey →
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-white/35 px-7 py-3.5 font-medium text-white transition hover:bg-white/10"
          >
            Back to home
          </Link>
        </div>

        <p className="mt-9 text-xs tracking-[.3em] text-gold">
          MORE VIETNAM
          <br />
          MORE YOU
        </p>
      </div>
    </main>
  );
}
