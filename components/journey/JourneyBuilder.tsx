"use client";

import Image from "next/image";

import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import {
  getCountries,
  getCountryCallingCode,
  type Country,
} from "react-phone-number-input";
import countryLabels from "react-phone-number-input/locale/en";

import {

  DEST,

  DUR,

  COMP,

  EXP,

  PACE,

  BUDGET,

} from "@/lib/journey-config";

import { initAttribution } from "@/lib/attribution/storage";

import { classify } from "@/lib/attribution/classify";

import { track, trackLeadSuccess } from "@/lib/analytics/events";

import { normalize, validateLead } from "@/lib/leads/validate";

/* =========================================================

   CONFIG

========================================================= */

const KEY = "lp_journey_en_v2";

const TOTAL = 5;

const COUNTRY_OPTIONS = getCountries()
  .map((country) => ({
    country,
    name: countryLabels[country] || country,
    code: `+${getCountryCallingCode(country)}`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

/* =========================================================

   JOURNEY STATE

========================================================= */

const init = {

  destinations: [] as string[],

  duration: "",

  travelDate: "",

  customDuration: "",

  companion: "",

  travelerCount: 1,

  experiences: [] as string[],

  pace: "",

  budget: "",

  specialRequests: "",

  submissionId: "",

};

type J = typeof init;

/* =========================================================

   DESTINATION IMAGES

========================================================= */

const DESTINATION_IMAGES: Record<string, string> = {

  "Northern Vietnam": "/images/journey/mien-bac.jpg",

  "Central Vietnam": "/images/journey/mien-trung.jpg",

  "Northwestern Vietnam": "/images/journey/mien-tay-bac.jpg",

  "Southern Vietnam": "/images/journey/mien-nam.jpg",

  "Across Vietnam": "/images/journey/xuyen-viet.jpg",

};

/* =========================================================

   GENERIC CARD

========================================================= */

function Card({
  label,
  sub,
  on,
  onClick,
  compact = false,
}: {
  label: string;
  sub?: string;
  on: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={on}
      onClick={onClick}
      className={`
        relative rounded-[16px] border text-left
        transition duration-200
        ${compact ? "min-h-[72px] p-3.5" : "min-h-[92px] p-4"}
        ${
          on
            ? `
              border-[#b99043]
              bg-[#0d493f]
              text-white
              ring-1
              ring-[#b99043]
              shadow-[0_10px_25px_rgba(13,73,63,0.14)]
            `
            : `
              border-black/10
              bg-[#fdfcf9]
              text-[#1e1d19]
              shadow-[0_5px_16px_rgba(0,0,0,0.04)]
              hover:border-[#b99043]
              hover:shadow-[0_9px_24px_rgba(0,0,0,0.08)]
            `
        }
      `}
    >
      <span
        className={`
          block pr-9 font-serif
          ${compact ? "text-[17px] leading-[1.15]" : "text-[20px]"}
        `}
      >
        {label}
      </span>

      {sub && (
        <span
          className={`
            block
            ${compact ? "mt-1 text-[11px] leading-4" : "mt-1.5 text-[12px] leading-4"}
            ${on ? "text-white/75" : "text-black/55"}
          `}
        >
          {sub}
        </span>
      )}

      {on && (
        <span
          aria-hidden
          className={`
            absolute right-3 top-3
            flex items-center justify-center
            rounded-full bg-[#d3a64e] text-white
            ${compact ? "h-6 w-6 text-xs" : "h-7 w-7 text-sm"}
          `}
        >
          ✓
        </span>
      )}
    </button>
  );
}

/* =========================================================

   DESTINATION CARD

========================================================= */

function DestinationCard({

  label,

  sub,

  on,

  onClick,

}: {

  label: string;

  sub?: string;

  on: boolean;

  onClick: () => void;

}) {

  const image = DESTINATION_IMAGES[label];

  return (

    <button

      type="button"

      role="option"

      aria-selected={on}

      onClick={onClick}

      className={`

        group relative block h-[160px] w-full

        overflow-hidden rounded-[17px] text-left

        shadow-[0_7px_22px_rgba(0,0,0,0.11)]

        transition duration-300

        hover:-translate-y-1

        hover:shadow-[0_14px_32px_rgba(0,0,0,0.17)]

        ${

          on

            ? `

              ring-2

              ring-[#d0a348]

              ring-offset-2

              ring-offset-white

            `

            : ""

        }

      `}

    >

      <div className="absolute inset-0 bg-[#174a42]" />

      {image && (

        <Image

          src={image}

          alt={label}

          fill

          sizes="

            (max-width: 768px) 100vw,

            (max-width: 1100px) 50vw,

            33vw

          "

          className="

            object-cover

            transition duration-700

            group-hover:scale-[1.05]

          "

        />

      )}

      <div

        className="

          absolute inset-0

          bg-gradient-to-t

          from-black/80

          via-black/15

          to-transparent

        "

      />

      <div

        className={`

          absolute right-4 top-4

          flex h-9 w-9 items-center justify-center

          rounded-full border

          backdrop-blur-sm

          transition

          ${

            on

              ? `

                border-[#d5aa54]

                bg-[#d5aa54]

                text-white

              `

              : `

                border-white/80

                bg-black/15

                text-transparent

              `

          }

        `}

      >

        ✓

      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 text-white">

        <h3 className="font-serif text-[22px] leading-none">

          {label}

        </h3>

        {sub && (

          <p className="mt-1.5 text-[11px] leading-[1.35] text-white/85">

            {sub}

          </p>

        )}

      </div>

    </button>

  );

}

/* =========================================================

   INPUT STYLE

========================================================= */

const inp = `

  mt-2

  w-full

  rounded-xl

  border

  border-black/15

  bg-[#fdfcf9]

  px-4

  py-2.5

  text-[15px]

  outline-none

  transition

  focus:border-[#9d8145]

  focus:ring-1

  focus:ring-[#9d8145]/30

`;

/* =========================================================

   MAIN

========================================================= */

export default function JourneyBuilder() {

  const router = useRouter();

  const [step, setStep] = useState(0);

  const [j, setJ] = useState<J>(init);

  const [c, setC] = useState({

    fullName: "",

    email: "",

    phone: "",

    countryIso: "VN" as Country,

    countryCode: "+84",

    consent: false,

  });

  const [errs, setErrs] =

    useState<Record<string, string>>({});

  const [status, setStatus] =

    useState<"idle" | "loading" | "error">("idle");

  const [msg, setMsg] = useState("");

  const busy = useRef(false);

  /* =========================================================

     RESTORE

  ========================================================= */

  useEffect(() => {

    try {

      const s = JSON.parse(

        localStorage.getItem(KEY) || "null",

      );

      if (s?.v === 2) {

        setJ({

          ...init,

          ...s.j,

        });

        setStep(

          Math.min(

            s.step || 0,

            TOTAL - 1,

          ),

        );

      }

    } catch {}

    setJ((x) =>

      x.submissionId

        ? x

        : {

            ...x,

            submissionId: crypto.randomUUID(),

          },

    );

    track(

      "journey_started",

      {},

      "js",

    );

    initAttribution();

  }, []);

  /* =========================================================

     PERSIST

  ========================================================= */

  useEffect(() => {

    if (!j.submissionId) return;

    try {

      localStorage.setItem(

        KEY,

        JSON.stringify({

          v: 2,

          step,

          j,

        }),

      );

    } catch {}

  }, [j, step]);

  /* =========================================================

     ANALYTICS

  ========================================================= */

  useEffect(() => {

    track(

      "journey_step_view",

      {

        step: step + 1,

      },

      "sv" + step,

    );

    if (step === TOTAL - 1) {

      track(

        "lead_form_view",

        {},

        "lf",

      );

    }

  }, [step]);

  /* =========================================================

     HELPERS

  ========================================================= */

  const toggle = (

    k: "destinations" | "experiences",

    v: string,

  ) => {

    setJ((x) => ({

      ...x,

      [k]: x[k].includes(v)

        ? x[k].filter((i) => i !== v)

        : [...x[k], v],

    }));

    track(

      "journey_option_selected",

      {

        field: k,

      },

    );

  };

  const set = (p: Partial<J>) =>

    setJ((x) => ({

      ...x,

      ...p,

    }));

  const optional =

    step === 1 ||

    step === 2 ||

    step === 3;

  /* =========================================================

     SUBMIT

  ========================================================= */

  async function submit() {

    if (busy.current) return;

    const att = initAttribution();

    const payload = {

      ...j,

      ...c,

      firstTouch: att.firstTouch,

      lastTouch: att.lastTouch,

    };

    const e = validateLead(

      normalize(payload),

    );

    setErrs(e);

    if (Object.keys(e).length) {

      return;

    }

    busy.current = true;

    setStatus("loading");

    setMsg("");

    track(

      "lead_submit_attempt",

    );

    try {

      const r =

        await fetch(

          "/api/leads",

          {

            method: "POST",

            headers: {

              "content-type":

                "application/json",

            },

            body:

              JSON.stringify(

                payload,

              ),

          },

        );

      const d =

        await r

          .json()

          .catch(() => null);

      if (!r.ok || !d?.success) {

        if (d?.fields) {

          setErrs(

            d.fields,

          );

        }

        throw new Error(

          d?.error || "fail",

        );

      }

      const ch =

        classify(

          att.firstTouch,

        );

      trackLeadSuccess(

        j.submissionId,

        {

          traffic_type:

            ch.trafficType,

          traffic_channel:

            ch.trafficChannel,

          journey_duration:

            j.duration,

          companion_type:

            j.companion,

        },

      );

      try {

        localStorage.removeItem(

          KEY,

        );

      } catch {}

      router.push(

        "/thank-you",

      );

    } catch {

      track(

        "lead_submit_error",

      );

      setStatus("error");

      setMsg(

        "We could not submit your request right now. Please try again shortly.",

      );

      busy.current = false;

    }

  }

  /* =========================================================

     ERRORS

  ========================================================= */

  const err = (k: string) =>

    errs[k] ? (

      <p

        id={k + "-e"}

        className="mt-1 text-sm text-red-700"

      >

        {errs[k]}

      </p>

    ) : null;

  /* =========================================================

     GENERIC GRID

  ========================================================= */

  const Grid = ({
    items,
    val,
    multi,
    k,
    compact = false,
  }: {
    items: string[][];
    val: string | string[];
    multi?:
      | "destinations"
      | "experiences";
    k?:
      | "duration"
      | "companion"
      | "pace";
    compact?: boolean;
  }) => (
    <div
      role="listbox"
      aria-multiselectable={!!multi}
      className={
        compact
          ? `
            grid
            grid-cols-2
            gap-2
            lg:grid-cols-4
          `
          : `
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-2
            lg:grid-cols-3
          `
      }
    >
      {items.map(([l, s]) => (
        <Card
          key={l}
          label={l}
          sub={s}
          compact={compact}
          on={
            multi
              ? (val as string[]).includes(l)
              : val === l
          }
          onClick={() =>
            multi
              ? toggle(multi, l)
              : set({
                  [k!]: l,
                } as Partial<J>)
          }
        />
      ))}
    </div>
  );

  /* =========================================================

     TITLE BLOCK

  ========================================================= */

  const T = (

    cat: string,

    title: string,

    desc: string,

  ) => (

    <>

      <p

        className="

          text-[11px]

          font-semibold

          uppercase

          tracking-[0.32em]

          text-[#6b6d50]

        "

      >

        {cat}

      </p>

      <h1

        className="

          mt-2

          whitespace-pre-line

          font-serif

          text-[36px]

          leading-[0.98]

          tracking-[-0.03em]

          text-[#1e1d19]

          md:text-[44px]

        "

      >

        {title}

      </h1>

      <p

        className="

          mb-4

          mt-2

          max-w-2xl

          text-[14px]

          leading-5

          text-black/60

        "

      >

        {desc}

      </p>

    </>

  );

  /* =========================================================

     UI

  ========================================================= */

  return (

    <main

      className="

        relative

        min-h-screen

        overflow-x-hidden

        text-[#1d1c18]

      "

    >

      {/* =====================================================

          BACKGROUND

      ====================================================== */}

      <div className="fixed inset-0 z-0">

        <Image

          src="/images/journey/vietnam-bg.jpg"

          alt=""

          fill

          priority

          sizes="100vw"

          className="

            object-cover

            object-center

          "

        />

        <div

          className="

            absolute

            inset-0

            bg-[#052f2b]/20

          "

        />

        <div

          className="

            absolute

            inset-0

            bg-gradient-to-b

            from-black/5

            via-transparent

            to-black/15

          "

        />

      </div>

      {/* =====================================================

          OUTER WRAPPER

      ====================================================== */}

      <div

        className="

          relative

          z-10

          min-h-screen

          px-3

          py-3

          md:px-5

          md:py-4

          lg:h-[100dvh]

          lg:overflow-hidden

          xl:px-6

          xl:py-4

        "

      >

        {/* ===================================================

            WHITE SURVEY PANEL

        ==================================================== */}

        <div

          className="

            mx-auto

            flex

            min-h-[calc(100vh-24px)]

            max-w-[1200px]

            flex-col

            overflow-hidden

            rounded-[26px]

            border

            border-white/70

            bg-white/95

            shadow-[0_25px_80px_rgba(0,0,0,0.26)]

            md:min-h-[calc(100vh-32px)]

            md:rounded-[32px]

            lg:h-[calc(100dvh-32px)]

            lg:min-h-0

          "

        >

          {/* =================================================

              ROUND LOGO

          ================================================== */}

          <header

            className="

              flex

              items-center

              justify-between

              px-6

              pt-3

              md:px-8

              md:pt-4

            "

          >

            <div

              className="

                relative

                h-[72px]

                w-[72px]

                shrink-0

                overflow-hidden

                rounded-full

                border

                border-[#d2a34a]/55

                bg-[#123f3a]

                shadow-[0_8px_24px_rgba(0,0,0,0.13)]

                md:h-[80px]

                md:w-[80px]

              "

            >

              <Image

                src="/images/logo-la-passion.png"

                alt="La Passion Travel"

                fill

                priority

                className="

                  object-contain p-3

                "

              />

            </div>

          </header>

          {/* =================================================

              JOURNEY CONTAINER

          ================================================== */}

          <div

            className="

              mx-auto

              flex

              w-full

              max-w-[1080px]

              flex-1

              flex-col

              px-6

              pb-4

              md:px-8

              md:pb-5

            "

          >

            {/* ===============================================

                NAVIGATION

            ================================================ */}

            <nav

              className="

                mt-1

                flex

                items-center

                text-sm

              "

            >

              <button

                type="button"

                onClick={() =>

                  step

                    ? setStep(

                        step - 1,

                      )

                    : router.push(

                        "/",

                      )

                }

                className="

                  min-w-[90px]

                  py-3

                  text-left

                  text-[13px]

                  text-black/75

                  transition

                  hover:text-[#987631]

                  md:min-w-[110px]

                "

              >

                ← Back

              </button>

              <div className="mx-3 flex-1 md:mx-6">

                <div

                  className="

                    mb-2

                    flex

                    items-center

                    justify-center

                  "

                >

                  <p

                    className="

                      text-[10px]

                      font-medium

                      uppercase

                      tracking-[0.18em]

                      text-black/55

                      md:text-[11px]

                    "

                  >

                    Step{" "}

                    {String(

                      step + 1,

                    ).padStart(

                      2,

                      "0",

                    )}{" "}

                    /{" "}

                    {String(

                      TOTAL,

                    ).padStart(

                      2,

                      "0",

                    )}

                  </p>

                </div>

                <div

                  className="

                    h-[2px]

                    overflow-hidden

                    rounded-full

                    bg-black/10

                  "

                >

                  <div

                    className="

                      h-full

                      bg-[#626a4d]

                      transition-all

                      duration-500

                    "

                    style={{

                      width: `${

                        ((step +

                          1) /

                          TOTAL) *

                        100

                      }%`,

                    }}

                  />

                </div>

              </div>

              {optional ? (

                <button

                  type="button"

                  onClick={() =>

                    setStep(

                      step + 1,

                    )

                  }

                  className="

                    min-w-[90px]

                    py-3

                    text-right

                    text-[13px]

                    text-black/75

                    transition

                    hover:text-[#987631]

                    md:min-w-[110px]

                  "

                >

                  Skip

                </button>

              ) : (

                <span className="min-w-[90px] md:min-w-[110px]" />

              )}

            </nav>

            {/* ===============================================

                CONTENT

            ================================================ */}

            <section
              className="
                min-h-0
                flex-1
                pt-2
                md:pt-3
              "
            >

              {/* =============================================

                  STEP 1 — DESTINATION

              ============================================== */}

              {step === 0 && (

                <>

                  {T(

                    "DESTINATIONS",

                    "Where in Vietnam\nwould you like to explore?",

                    "Choose one or more destinations you love. We will suggest the journey that suits you best.",

                  )}

                  <div

                    role="listbox"

                    aria-multiselectable="true"

                    className="

                      grid

                      grid-cols-1

                      gap-3

                      md:grid-cols-2

                      lg:grid-cols-6

                    "

                  >

                    {DEST.map(

                      (

                        [

                          label,

                          sub,

                        ],

                        index,

                      ) => (

                        <div

                          key={label}

                          className={`

                            lg:col-span-2

                            ${

                              index === 3

                                ? "lg:col-start-2"

                                : ""

                            }

                          `}

                        >

                          <DestinationCard

                            label={label}

                            sub={sub}

                            on={j.destinations.includes(

                              label,

                            )}

                            onClick={() =>

                              toggle(

                                "destinations",

                                label,

                              )

                            }

                          />

                        </div>

                      ),

                    )}

                  </div>

                  <div

                    className="

                      mt-7

                      flex

                      items-end

                      justify-between

                    "

                  >

                    <p

                      className="

                        hidden

                        rotate-[-4deg]

                        font-serif

                        text-[18px]

                        italic

                        leading-6

                        text-[#595c4d]/55

                        md:block

                      "

                    >

                      “Every destination

                      <br />

                      has a story

                      of its own”

                    </p>

                    <button

                      type="button"

                      onClick={() =>

                        setStep(1)

                      }

                      className="

                        ml-auto

                        inline-flex

                        min-w-[180px]

                        items-center

                        justify-center

                        gap-3

                        rounded-[11px]

                        bg-[#cda14c]

                        px-8

                        py-4

                        text-[15px]

                        font-medium

                        text-[#153e37]

                        shadow-[0_9px_22px_rgba(100,75,25,0.18)]

                        transition

                        hover:-translate-y-0.5

                        hover:bg-[#d8ad5b]

                      "

                    >

                      Continue

                      <span className="text-lg">

                        →

                      </span>

                    </button>

                  </div>

                </>

              )}

              {/* =============================================

                  STEP 2 — DURATION

              ============================================== */}

              {step === 1 && (

                <>

                  {T(

                    "TRAVEL DATES",

                    "When are you thinking\nof traveling?",

                    "Choose a trip length or enter your own. We will plan around the season, weather, and best experiences.",

                  )}

                  <Grid

                    items={DUR}

                    val={j.duration}

                    k="duration"

                  />

                  <div

                    className="

                      mt-6

                      grid

                      gap-4

                      sm:grid-cols-2

                    "

                  >

                    {/* DATE PICKER - FIXED */}

                    <label className="text-sm font-medium text-black/75">

                      Preferred departure date

                      <input

                        type="date"

                        className={`${inp} cursor-pointer [color-scheme:light]`}

                        value={j.travelDate}

                        onChange={(e) =>

                          set({

                            travelDate:

                              e.currentTarget

                                .value,

                          })

                        }

                        onClick={(e) => {

                          const input =

                            e.currentTarget;

                          try {

                            if (

                              typeof input.showPicker ===

                              "function"

                            ) {

                              input.showPicker();

                            }

                          } catch {}

                        }}

                      />

                    </label>

                    <label className="text-sm font-medium text-black/75">

                      Custom trip length

                      <input

                        className={inp}

                        maxLength={40}

                        value={

                          j.customDuration

                        }

                        onChange={(e) =>

                          set({

                            customDuration:

                              e

                                .currentTarget

                                .value,

                          })

                        }

                        placeholder="For example: 7 days"

                      />

                    </label>

                  </div>

                </>

              )}

              {/* =============================================

                  STEP 3 — COMPANION

              ============================================== */}

              {step === 2 && (

                <>

                  {T(

                    "TRAVEL COMPANIONS",

                    "Who is this trip for?",

                    "Every journey is more memorable when it is designed for the people traveling with you.",

                  )}

                  <Grid

                    items={COMP}

                    val={j.companion}

                    k="companion"

                  />

                  {j.companion &&

                    j.companion !==

                      "Solo traveler" && (

                      <div

                        className="

                          mt-6

                          inline-flex

                          items-center

                          gap-4

                          rounded-xl

                          border

                          border-black/10

                          bg-[#fdfcf9]

                          px-5

                          py-3

                        "

                      >

                        <span>

                          Number of travelers

                        </span>

                        <button

                          type="button"

                          aria-label="Decrease travelers"

                          className="

                            h-10

                            w-10

                            rounded-lg

                            border

                            border-black/15

                            bg-white

                          "

                          onClick={() =>

                            set({

                              travelerCount:

                                Math.max(

                                  1,

                                  j.travelerCount -

                                    1,

                                ),

                            })

                          }

                        >

                          −

                        </button>

                        <output className="min-w-6 text-center font-medium">

                          {

                            j.travelerCount

                          }

                        </output>

                        <button

                          type="button"

                          aria-label="Increase travelers"

                          className="

                            h-10

                            w-10

                            rounded-lg

                            border

                            border-black/15

                            bg-white

                          "

                          onClick={() =>

                            set({

                              travelerCount:

                                Math.min(

                                  500,

                                  j.travelerCount +

                                    1,

                                ),

                            })

                          }

                        >

                          +

                        </button>

                      </div>

                    )}

                </>

              )}

              {/* =============================================

                  STEP 4 — EXPERIENCE

              ============================================== */}

              {step === 3 && (
                <>
                  {T(
                    "EXPERIENCES",
                    "How would you like to\nexperience Vietnam?",
                    "Choose the experiences that excite you most. There is no wrong choice, only the journey that fits you best.",
                  )}

                  <Grid
                    items={EXP}
                    val={j.experiences}
                    multi="experiences"
                    compact
                  />

                  <h2
                    className="
                      mb-2
                      mt-4
                      font-serif
                      text-[22px]
                      leading-tight
                      md:text-[24px]
                    "
                  >
                    What travel pace suits you best?
                  </h2>

                  <Grid
                    items={PACE}
                    val={j.pace}
                    k="pace"
                    compact
                  />
                </>
              )}

              {/* =============================================

                  STEP 5 — CONTACT

              ============================================== */}

              {step === 4 && (
                <>
                  {T(
                    "YOUR DETAILS",
                    "Just one more step...",
                    "Share a few details so we can design a journey that fits you best.",
                  )}

                  <div
                    className="
                      grid
                      overflow-hidden
                      rounded-[22px]
                      border
                      border-black/10
                      bg-[#fdfcf9]
                      shadow-[0_12px_35px_rgba(0,0,0,0.07)]
                      lg:grid-cols-[1.4fr_0.6fr]
                    "
                  >
                    {/* LEFT FORM */}
                    <div className="p-4 md:p-5">
                      <div className="grid gap-2.5">
                        {/* BUDGET + SPECIAL REQUEST */}
                        <div className="grid gap-3 md:grid-cols-[0.9fr_1.1fr]">
                          <label className="text-sm font-medium text-black/75">
                            Estimated budget per person
                            <select
                              className={inp}
                              value={j.budget}
                              onChange={(e) =>
                                set({
                                  budget: e.currentTarget.value,
                                })
                              }
                            >
                              <option value="">
                                Select a budget range
                              </option>

                              {BUDGET.map((b) => (
                                <option key={b} value={b}>
                                  {b}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="text-sm font-medium text-black/75">
                            Special requests (optional)
                            <textarea
                              className={inp}
                              rows={1}
                              maxLength={500}
                              value={j.specialRequests}
                              onChange={(e) =>
                                set({
                                  specialRequests: e.currentTarget.value,
                                })
                              }
                              placeholder="Anniversary, local food, hotel preferences..."
                            />
                          </label>
                        </div>

                        {/* CONTACT HEADING */}
                        <div className="border-t border-black/10 pt-2">
                          <h2 className="font-serif text-[22px]">
                            Contact details
                          </h2>
                          <p className="mt-0.5 text-[12px] leading-4 text-black/50">
                            We will contact you by email or WhatsApp to finalize your journey.
                          </p>
                        </div>

                        {/* NAME + EMAIL */}
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <label className="text-sm font-medium text-black/75">
                              Full name
                              <input
                                className={inp}
                                autoComplete="name"
                                aria-invalid={!!errs.fullName}
                                aria-describedby="fullName-e"
                                value={c.fullName}
                                onChange={(e) =>
                                  setC({
                                    ...c,
                                    fullName: e.currentTarget.value,
                                  })
                                }
                                placeholder="Your full name"
                              />
                            </label>
                            {err("fullName")}
                          </div>

                          <div>
                            <label className="text-sm font-medium text-black/75">
                              Email
                              <input
                                type="email"
                                className={inp}
                                autoComplete="email"
                                aria-invalid={!!errs.email}
                                aria-describedby="email-e"
                                value={c.email}
                                onChange={(e) =>
                                  setC({
                                    ...c,
                                    email: e.currentTarget.value,
                                  })
                                }
                                placeholder="you@example.com"
                              />
                            </label>
                            {err("email")}
                          </div>
                        </div>

                        {/* COUNTRY + WHATSAPP */}
                        <div className="grid gap-3 md:grid-cols-[0.95fr_1.05fr]">
                          <label className="text-sm font-medium text-black/75">
                            Country / calling code
                            <select
                              className={inp}
                              value={c.countryIso}
                              onChange={(e) => {
                                const country = e.currentTarget.value as Country;
                                setC({
                                  ...c,
                                  countryIso: country,
                                  countryCode: `+${getCountryCallingCode(country)}`,
                                });
                              }}
                            >
                              {COUNTRY_OPTIONS.map(({ country, name, code }) => (
                                <option key={country} value={country}>
                                  {name} ({code})
                                </option>
                              ))}
                            </select>
                          </label>

                          <div>
                            <label className="text-sm font-medium text-black/75">
                              WhatsApp number (optional)
                              <input
                                type="tel"
                                inputMode="tel"
                                aria-label="WhatsApp number"
                                className={inp}
                                autoComplete="tel-national"
                                aria-invalid={!!errs.phone}
                                aria-describedby="phone-e"
                                value={c.phone}
                                onChange={(e) =>
                                  setC({
                                    ...c,
                                    phone: e.currentTarget.value,
                                  })
                                }
                                placeholder="912 345 678"
                              />
                            </label>
                            {err("phone")}
                          </div>
                        </div>

                        {/* CONSENT + SUBMIT */}
                        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-stretch">
                          <div>
                            <label
                              className="
                                flex h-full items-center gap-3
                                rounded-xl bg-[#f5f2e9]
                                px-3 py-2.5
                                text-[13px] leading-5
                                text-black/70
                              "
                            >
                              <input
                                type="checkbox"
                                className="
                                  h-5 w-5 shrink-0
                                  accent-[#66704f]
                                "
                                checked={c.consent}
                                onChange={(e) =>
                                  setC({
                                    ...c,
                                    consent: e.currentTarget.checked,
                                  })
                                }
                                aria-invalid={!!errs.consent}
                              />
                              <span>
                                I agree to receive travel advice and updates from La Passion Travel.
                              </span>
                            </label>
                            {err("consent")}
                          </div>

                          <button
                            type="button"
                            onClick={submit}
                            disabled={status === "loading"}
                            className="
                              inline-flex min-h-[52px]
                              w-full items-center justify-center gap-2
                              rounded-xl bg-[#cda14c]
                              px-7 py-3
                              font-semibold text-[#153e37]
                              shadow-[0_8px_22px_rgba(100,75,25,0.14)]
                              transition
                              hover:-translate-y-0.5
                              hover:bg-[#d8ad5b]
                              disabled:opacity-60
                              md:w-auto
                              md:min-w-[205px]
                            "
                          >
                            {status === "loading"
                              ? "Submitting…"
                              : status === "error"
                                ? "Try again →"
                                : "Request journey →"}
                          </button>
                        </div>

                        {msg && (
                          <p
                            role="alert"
                            className="
                              rounded-xl
                              border border-red-700/30
                              bg-red-50
                              p-2.5
                              text-sm text-red-800
                            "
                          >
                            {msg}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* RIGHT IMAGE */}
                    <div
                      className="
                        relative hidden
                        min-h-[390px]
                        overflow-hidden
                        lg:block
                      "
                    >
                      <Image
                        src="/images/journey/Danang.jpg"
                        alt="Vietnam travel"
                        fill
                        sizes="34vw"
                        className="object-cover"
                      />

                      <div
                        className="
                          absolute inset-0
                          bg-gradient-to-t
                          from-[#073d38]/85
                          via-[#073d38]/15
                          to-transparent
                        "
                      />

                      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-[#e0b45d]">
                          La Passion Travel
                        </p>
                        <p className="mt-2 max-w-[240px] font-serif text-[25px] leading-[1.02]">
                          Your journey starts here.
                        </p>
                        <p className="mt-2 max-w-[240px] text-[12px] leading-4 text-white/75">
                          A journey tailored to the way you want to experience Vietnam.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

            </section>

            {/* ===============================================
                BOTTOM ACTION
            ================================================ */}

            {step > 0 && step < TOTAL - 1 && (
              <div className="mt-3 flex justify-end pb-1">
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="
                    w-full
                    rounded-xl
                    bg-[#cda14c]
                    px-9
                    py-3
                    font-medium
                    text-[#153e37]
                    shadow-[0_8px_22px_rgba(100,75,25,0.14)]
                    transition
                    hover:-translate-y-0.5
                    hover:bg-[#d8ad5b]
                    sm:w-auto
                  "
                >
                  Continue →
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

    </main>

  );

}
  .map((country) => ({
    country,
    name: countryLabels[country] || country,
    code: `+${getCountryCallingCode(country)}`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

/* =========================================================
   JOURNEY STATE
========================================================= */

const init = {
  destinations: [] as string[],
  duration: "",
  travelDate: "",
  customDuration: "",
  companion: "",
  travelerCount: 1,
  experiences: [] as string[],
  pace: "",
  budget: "",
  specialRequests: "",
  submissionId: "",
};

type J = typeof init;

/* =========================================================
   DESTINATION IMAGES
========================================================= */

const DESTINATION_IMAGES: Record<string, string> = {
  "Northern Vietnam": "/images/journey/mien-bac.jpg",
  "Central Vietnam": "/images/journey/mien-trung.jpg",
  "Northwestern Vietnam": "/images/journey/mien-tay-bac.jpg",
  "Southern Vietnam": "/images/journey/mien-nam.jpg",
  "Across Vietnam": "/images/journey/xuyen-viet.jpg",
};

/* =========================================================
   GENERIC CARD
========================================================= */

function Card({
  label,
  sub,
  on,
  onClick,
}: {
  label: string;
  sub?: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={on}
      onClick={onClick}
      className={`
        relative min-h-[92px] rounded-[16px] border p-4 text-left
        transition duration-200
        ${
          on
            ? `
              border-[#b99043]
              bg-[#0d493f]
              text-white
              ring-1
              ring-[#b99043]
              shadow-[0_10px_25px_rgba(13,73,63,0.14)]
            `
            : `
              border-black/10
              bg-[#fdfcf9]
              text-[#1e1d19]
              shadow-[0_5px_16px_rgba(0,0,0,0.04)]
              hover:border-[#b99043]
              hover:shadow-[0_9px_24px_rgba(0,0,0,0.08)]
            `
        }
      `}
    >
      <span className="block pr-9 font-serif text-[20px]">
        {label}
      </span>

      {sub && (
        <span
          className={`mt-1.5 block text-[12px] leading-4 ${
            on ? "text-white/75" : "text-black/55"
          }`}
        >
          {sub}
        </span>
      )}

      {on && (
        <span
          aria-hidden
          className="
            absolute right-4 top-4
            flex h-7 w-7 items-center justify-center
            rounded-full bg-[#d3a64e]
            text-sm text-white
          "
        >
          ✓
        </span>
      )}
    </button>
  );
}

/* =========================================================
   DESTINATION CARD
========================================================= */

function DestinationCard({
  label,
  sub,
  on,
  onClick,
}: {
  label: string;
  sub?: string;
  on: boolean;
  onClick: () => void;
}) {
  const image = DESTINATION_IMAGES[label];

  return (
    <button
      type="button"
      role="option"
      aria-selected={on}
      onClick={onClick}
      className={`
        group relative block h-[160px] w-full
        overflow-hidden rounded-[17px] text-left
        shadow-[0_7px_22px_rgba(0,0,0,0.11)]
        transition duration-300
        hover:-translate-y-1
        hover:shadow-[0_14px_32px_rgba(0,0,0,0.17)]
        ${
          on
            ? `
              ring-2
              ring-[#d0a348]
              ring-offset-2
              ring-offset-white
            `
            : ""
        }
      `}
    >
      <div className="absolute inset-0 bg-[#174a42]" />

      {image && (
        <Image
          src={image}
          alt={label}
          fill
          sizes="
            (max-width: 768px) 100vw,
            (max-width: 1100px) 50vw,
            33vw
          "
          className="
            object-cover
            transition duration-700
            group-hover:scale-[1.05]
          "
        />
      )}

      <div
        className="
          absolute inset-0
          bg-gradient-to-t
          from-black/80
          via-black/15
          to-transparent
        "
      />

      <div
        className={`
          absolute right-4 top-4
          flex h-9 w-9 items-center justify-center
          rounded-full border
          backdrop-blur-sm
          transition
          ${
            on
              ? `
                border-[#d5aa54]
                bg-[#d5aa54]
                text-white
              `
              : `
                border-white/80
                bg-black/15
                text-transparent
              `
          }
        `}
      >
        ✓
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <h3 className="font-serif text-[22px] leading-none">
          {label}
        </h3>

        {sub && (
          <p className="mt-1.5 text-[11px] leading-[1.35] text-white/85">
            {sub}
          </p>
        )}
      </div>
    </button>
  );
}

/* =========================================================
   INPUT STYLE
========================================================= */

const inp = `
  mt-2
  w-full
  rounded-xl
  border
  border-black/15
  bg-[#fdfcf9]
  px-4
  py-2.5
  text-[15px]
  outline-none
  transition
  focus:border-[#9d8145]
  focus:ring-1
  focus:ring-[#9d8145]/30
`;

/* =========================================================
   MAIN
========================================================= */

export default function JourneyBuilder() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [j, setJ] = useState<J>(init);

  const [c, setC] = useState({
    fullName: "",
    email: "",
    phone: "",
    countryIso: "VN" as Country,
    countryCode: "+84",
    consent: false,
  });

  const [errs, setErrs] =
    useState<Record<string, string>>({});

  const [status, setStatus] =
    useState<"idle" | "loading" | "error">("idle");

  const [msg, setMsg] = useState("");

  const busy = useRef(false);

  /* =========================================================
     RESTORE
  ========================================================= */

  useEffect(() => {
    try {
      const s = JSON.parse(
        localStorage.getItem(KEY) || "null",
      );

      if (s?.v === 2) {
        setJ({
          ...init,
          ...s.j,
        });

        setStep(
          Math.min(
            s.step || 0,
            TOTAL - 1,
          ),
        );
      }
    } catch {}

    setJ((x) =>
      x.submissionId
        ? x
        : {
            ...x,
            submissionId: crypto.randomUUID(),
          },
    );

    track(
      "journey_started",
      {},
      "js",
    );

    initAttribution();
  }, []);

  /* =========================================================
     PERSIST
  ========================================================= */

  useEffect(() => {
    if (!j.submissionId) return;

    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          v: 2,
          step,
          j,
        }),
      );
    } catch {}
  }, [j, step]);

  /* =========================================================
     ANALYTICS
  ========================================================= */

  useEffect(() => {
    track(
      "journey_step_view",
      {
        step: step + 1,
      },
      "sv" + step,
    );

    if (step === TOTAL - 1) {
      track(
        "lead_form_view",
        {},
        "lf",
      );
    }
  }, [step]);

  /* =========================================================
     HELPERS
  ========================================================= */

  const toggle = (
    k: "destinations" | "experiences",
    v: string,
  ) => {
    setJ((x) => ({
      ...x,
      [k]: x[k].includes(v)
        ? x[k].filter((i) => i !== v)
        : [...x[k], v],
    }));

    track(
      "journey_option_selected",
      {
        field: k,
      },
    );
  };

  const set = (p: Partial<J>) =>
    setJ((x) => ({
      ...x,
      ...p,
    }));

  const optional =
    step === 1 ||
    step === 2 ||
    step === 3;

  /* =========================================================
     SUBMIT
  ========================================================= */

  async function submit() {
    if (busy.current) return;

    const att = initAttribution();

    const payload = {
      ...j,
      ...c,
      firstTouch: att.firstTouch,
      lastTouch: att.lastTouch,
    };

    const e = validateLead(
      normalize(payload),
    );

    setErrs(e);

    if (Object.keys(e).length) {
      return;
    }

    busy.current = true;

    setStatus("loading");
    setMsg("");

    track(
      "lead_submit_attempt",
    );

    try {
      const r =
        await fetch(
          "/api/leads",
          {
            method: "POST",
            headers: {
              "content-type":
                "application/json",
            },
            body:
              JSON.stringify(
                payload,
              ),
          },
        );

      const d =
        await r
          .json()
          .catch(() => null);

      if (!r.ok || !d?.success) {
        if (d?.fields) {
          setErrs(
            d.fields,
          );
        }

        throw new Error(
          d?.error || "fail",
        );
      }

      const ch =
        classify(
          att.firstTouch,
        );

      trackLeadSuccess(
        j.submissionId,
        {
          traffic_type:
            ch.trafficType,
          traffic_channel:
            ch.trafficChannel,
          journey_duration:
            j.duration,
          companion_type:
            j.companion,
        },
      );

      try {
        localStorage.removeItem(
          KEY,
        );
      } catch {}

      router.push(
        "/thank-you",
      );
    } catch {
      track(
        "lead_submit_error",
      );

      setStatus("error");

      setMsg(
        "We could not submit your request right now. Please try again shortly.",
      );

      busy.current = false;
    }
  }

  /* =========================================================
     ERRORS
  ========================================================= */

  const err = (k: string) =>
    errs[k] ? (
      <p
        id={k + "-e"}
        className="mt-1 text-sm text-red-700"
      >
        {errs[k]}
      </p>
    ) : null;

  /* =========================================================
     GENERIC GRID
  ========================================================= */

  const Grid = ({
    items,
    val,
    multi,
    k,
  }: {
    items: string[][];
    val: string | string[];

    multi?:
      | "destinations"
      | "experiences";

    k?:
      | "duration"
      | "companion"
      | "pace";
  }) => (
    <div
      role="listbox"
      aria-multiselectable={!!multi}
      className="
        grid
        grid-cols-1
        gap-3
        sm:grid-cols-2
        lg:grid-cols-3
      "
    >
      {items.map(([l, s]) => (
        <Card
          key={l}
          label={l}
          sub={s}
          on={
            multi
              ? (
                  val as string[]
                ).includes(l)
              : val === l
          }
          onClick={() =>
            multi
              ? toggle(
                  multi,
                  l,
                )
              : set({
                  [k!]: l,
                } as Partial<J>)
          }
        />
      ))}
    </div>
  );

  /* =========================================================
     TITLE BLOCK
  ========================================================= */

  const T = (
    cat: string,
    title: string,
    desc: string,
  ) => (
    <>
      <p
        className="
          text-[11px]
          font-semibold
          uppercase
          tracking-[0.32em]
          text-[#6b6d50]
        "
      >
        {cat}
      </p>

      <h1
        className="
          mt-2
          whitespace-pre-line
          font-serif
          text-[36px]
          leading-[0.98]
          tracking-[-0.03em]
          text-[#1e1d19]
          md:text-[44px]
        "
      >
        {title}
      </h1>

      <p
        className="
          mb-4
          mt-2
          max-w-2xl
          text-[14px]
          leading-5
          text-black/60
        "
      >
        {desc}
      </p>
    </>
  );

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-x-hidden
        text-[#1d1c18]
      "
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="fixed inset-0 z-0">
        <Image
          src="/images/journey/vietnam-bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="
            object-cover
            object-center
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-[#052f2b]/20
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-black/5
            via-transparent
            to-black/15
          "
        />
      </div>

      {/* =====================================================
          OUTER WRAPPER
      ====================================================== */}

      <div
        className="
          relative
          z-10
          min-h-screen
          px-3
          py-3

          md:px-5
          md:py-4

          lg:h-[100dvh]
          lg:overflow-hidden

          xl:px-6
          xl:py-4
        "
      >
        {/* ===================================================
            WHITE SURVEY PANEL
        ==================================================== */}

        <div
          className="
            mx-auto
            flex
            min-h-[calc(100vh-24px)]
            max-w-[1200px]
            flex-col
            overflow-hidden
            rounded-[26px]
            border
            border-white/70
            bg-white/95
            shadow-[0_25px_80px_rgba(0,0,0,0.26)]

            md:min-h-[calc(100vh-32px)]
            md:rounded-[32px]

            lg:h-[calc(100dvh-32px)]
            lg:min-h-0
          "
        >
          {/* =================================================
              ROUND LOGO
          ================================================== */}

          <header
            className="
              flex
              items-center
              justify-between
              px-6
              pt-3

              md:px-8
              md:pt-4
            "
          >
            <div
              className="
                relative
                h-[72px]
                w-[72px]
                shrink-0
                overflow-hidden
                rounded-full
                border
                border-[#d2a34a]/55
                bg-[#123f3a]
                shadow-[0_8px_24px_rgba(0,0,0,0.13)]

                md:h-[80px]
                md:w-[80px]
              "
            >
              <Image
                src="/images/logo-la-passion.png"
                alt="La Passion Travel"
                fill
                priority
                className="
                  object-contain p-3
                "
              />
            </div>
          </header>

          {/* =================================================
              JOURNEY CONTAINER
          ================================================== */}

          <div
            className="
              mx-auto
              flex
              w-full
              max-w-[1080px]
              flex-1
              flex-col
              px-6
              pb-4

              md:px-8
              md:pb-5
            "
          >
            {/* ===============================================
                NAVIGATION
            ================================================ */}

            <nav
              className="
                mt-1
                flex
                items-center
                text-sm
              "
            >
              <button
                type="button"
                onClick={() =>
                  step
                    ? setStep(
                        step - 1,
                      )
                    : router.push(
                        "/",
                      )
                }
                className="
                  min-w-[90px]
                  py-3
                  text-left
                  text-[13px]
                  text-black/75
                  transition
                  hover:text-[#987631]

                  md:min-w-[110px]
                "
              >
                ← Back
              </button>

              <div className="mx-3 flex-1 md:mx-6">
                <div
                  className="
                    mb-2
                    flex
                    items-center
                    justify-center
                  "
                >
                  <p
                    className="
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.18em]
                      text-black/55

                      md:text-[11px]
                    "
                  >
                    Step{" "}
                    {String(
                      step + 1,
                    ).padStart(
                      2,
                      "0",
                    )}{" "}
                    /{" "}
                    {String(
                      TOTAL,
                    ).padStart(
                      2,
                      "0",
                    )}
                  </p>
                </div>

                <div
                  className="
                    h-[2px]
                    overflow-hidden
                    rounded-full
                    bg-black/10
                  "
                >
                  <div
                    className="
                      h-full
                      bg-[#626a4d]
                      transition-all
                      duration-500
                    "
                    style={{
                      width: `${
                        ((step +
                          1) /
                          TOTAL) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {optional ? (
                <button
                  type="button"
                  onClick={() =>
                    setStep(
                      step + 1,
                    )
                  }
                  className="
                    min-w-[90px]
                    py-3
                    text-right
                    text-[13px]
                    text-black/75
                    transition
                    hover:text-[#987631]

                    md:min-w-[110px]
                  "
                >
                  Skip
                </button>
              ) : (
                <span className="min-w-[90px] md:min-w-[110px]" />
              )}
            </nav>

            {/* ===============================================
                CONTENT
            ================================================ */}

            <section
              className="
                flex-1
                pt-4
                md:pt-5
              "
            >
              {/* =============================================
                  STEP 1 — DESTINATION
              ============================================== */}

              {step === 0 && (
                <>
                  {T(
                    "DESTINATIONS",
                    "Where in Vietnam\nwould you like to explore?",
                    "Choose one or more destinations you love. We will suggest the journey that suits you best.",
                  )}

                  <div
                    role="listbox"
                    aria-multiselectable="true"
                    className="
                      grid
                      grid-cols-1
                      gap-3

                      md:grid-cols-2
                      lg:grid-cols-6
                    "
                  >
                    {DEST.map(
                      (
                        [
                          label,
                          sub,
                        ],
                        index,
                      ) => (
                        <div
                          key={label}
                          className={`
                            lg:col-span-2

                            ${
                              index === 3
                                ? "lg:col-start-2"
                                : ""
                            }
                          `}
                        >
                          <DestinationCard
                            label={label}
                            sub={sub}
                            on={j.destinations.includes(
                              label,
                            )}
                            onClick={() =>
                              toggle(
                                "destinations",
                                label,
                              )
                            }
                          />
                        </div>
                      ),
                    )}
                  </div>

                  <div
                    className="
                      mt-7
                      flex
                      items-end
                      justify-between
                    "
                  >
                    <p
                      className="
                        hidden
                        rotate-[-4deg]
                        font-serif
                        text-[18px]
                        italic
                        leading-6
                        text-[#595c4d]/55

                        md:block
                      "
                    >
                      “Every destination
                      <br />
                      has a story
                      <br />
                      of its own”
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setStep(1)
                      }
                      className="
                        ml-auto
                        inline-flex
                        min-w-[180px]
                        items-center
                        justify-center
                        gap-3
                        rounded-[11px]
                        bg-[#cda14c]
                        px-8
                        py-4
                        text-[15px]
                        font-medium
                        text-[#153e37]
                        shadow-[0_9px_22px_rgba(100,75,25,0.18)]
                        transition
                        hover:-translate-y-0.5
                        hover:bg-[#d8ad5b]
                      "
                    >
                      Continue

                      <span className="text-lg">
                        →
                      </span>
                    </button>
                  </div>
                </>
              )}

              {/* =============================================
                  STEP 2 — DURATION
              ============================================== */}

              {step === 1 && (
                <>
                  {T(
                    "TRAVEL DATES",
                    "When are you thinking\nof traveling?",
                    "Choose a trip length or enter your own. We will plan around the season, weather, and best experiences.",
                  )}

                  <Grid
                    items={DUR}
                    val={j.duration}
                    k="duration"
                  />

                  <div
                    className="
                      mt-6
                      grid
                      gap-4

                      sm:grid-cols-2
                    "
                  >
                    <label className="text-sm font-medium text-black/75">
                      Preferred departure date

                      <input
                        type="date"
                        className={`${inp} cursor-pointer [color-scheme:light]`}
                        value={j.travelDate}
                        onChange={(e) =>
                          set({
                            travelDate:
                              e.currentTarget.value,
                          })
                        }
                        onClick={(e) => {
                          const input =
                            e.currentTarget;

                          try {
                            if (
                              typeof input.showPicker ===
                              "function"
                            ) {
                              input.showPicker();
                            }
                          } catch {}
                        }}
                      />
                    </label>

                    <label className="text-sm font-medium text-black/75">
                      Custom trip length

                      <input
                        className={inp}
                        maxLength={40}
                        value={
                          j.customDuration
                        }
                        onChange={(e) =>
                          set({
                            customDuration:
                              e.currentTarget.value,
                          })
                        }
                        placeholder="For example: 7 days"
                      />
                    </label>
                  </div>
                </>
              )}

              {/* =============================================
                  STEP 3 — COMPANION
              ============================================== */}

              {step === 2 && (
                <>
                  {T(
                    "TRAVEL COMPANIONS",
                    "Who is this trip for?",
                    "Every journey is more memorable when it is designed for the people traveling with you.",
                  )}

                  <Grid
                    items={COMP}
                    val={j.companion}
                    k="companion"
                  />

                  {j.companion &&
                    j.companion !==
                      "Solo traveler" && (
                      <div
                        className="
                          mt-6
                          inline-flex
                          items-center
                          gap-4
                          rounded-xl
                          border
                          border-black/10
                          bg-[#fdfcf9]
                          px-5
                          py-3
                        "
                      >
                        <span>
                          Number of travelers
                        </span>

                        <button
                          type="button"
                          aria-label="Decrease travelers"
                          className="
                            h-10
                            w-10
                            rounded-lg
                            border
                            border-black/15
                            bg-white
                          "
                          onClick={() =>
                            set({
                              travelerCount:
                                Math.max(
                                  1,
                                  j.travelerCount -
                                    1,
                                ),
                            })
                          }
                        >
                          −
                        </button>

                        <output className="min-w-6 text-center font-medium">
                          {
                            j.travelerCount
                          }
                        </output>

                        <button
                          type="button"
                          aria-label="Increase travelers"
                          className="
                            h-10
                            w-10
                            rounded-lg
                            border
                            border-black/15
                            bg-white
                          "
                          onClick={() =>
                            set({
                              travelerCount:
                                Math.min(
                                  500,
                                  j.travelerCount +
                                    1,
                                ),
                            })
                          }
                        >
                          +
                        </button>
                      </div>
                    )}
                </>
              )}

              {/* =============================================
                  STEP 4 — EXPERIENCE
              ============================================== */}

              {step === 3 && (
                <>
                  {T(
                    "EXPERIENCES",
                    "How would you like to\nexperience Vietnam?",
                    "Choose the experiences that excite you most. There is no wrong choice, only the journey that fits you best.",
                  )}

                  <Grid
                    items={EXP}
                    val={
                      j.experiences
                    }
                    multi="experiences"
                  />

                  <h2
                    className="
                      mb-4
                      mt-8
                      font-serif
                      text-[25px]
                    "
                  >
                    What travel pace
                    suits you best?
                  </h2>

                  <Grid
                    items={PACE}
                    val={j.pace}
                    k="pace"
                  />
                </>
              )}

              {/* =============================================
                  STEP 5 — CONTACT
              ============================================== */}

              {step === 4 && (
                <>
                  {T(
                    "YOUR DETAILS",
                    "Just one more step...",
                    "Share a few details so we can design a journey that fits you best.",
                  )}

                  <div
                    className="
                      grid
                      overflow-hidden
                      rounded-[22px]
                      border
                      border-black/10
                      bg-[#fdfcf9]
                      shadow-[0_12px_35px_rgba(0,0,0,0.07)]

                      lg:grid-cols-[1.15fr_0.85fr]
                    "
                  >
                    {/* LEFT FORM */}

                    <div className="p-4 md:p-5">
                      <div className="grid gap-2.5">
                        {/* BUDGET */}

                        <label className="text-sm font-medium text-black/75">
                          Estimated budget per person

                          <select
                            className={inp}
                            value={j.budget}
                            onChange={(e) =>
                              set({
                                budget:
                                  e.currentTarget.value,
                              })
                            }
                          >
                            <option value="">
                              Select a budget range
                            </option>

                            {BUDGET.map((b) => (
                              <option
                                key={b}
                                value={b}
                              >
                                {b}
                              </option>
                            ))}
                          </select>
                        </label>

                        {/* SPECIAL REQUEST */}

                        <label className="text-sm font-medium text-black/75">
                          Special requests (optional)

                          <textarea
                            className={inp}
                            rows={1}
                            maxLength={500}
                            value={
                              j.specialRequests
                            }
                            onChange={(e) =>
                              set({
                                specialRequests:
                                  e.currentTarget.value,
                              })
                            }
                            placeholder="For example: an anniversary, local food experiences, luxury hotels..."
                          />
                        </label>

                        {/* CONTACT HEADING */}

                        <div className="border-t border-black/10 pt-2">
                          <h2 className="font-serif text-[24px]">
                            Contact details
                          </h2>

                          <p className="mt-1 text-[13px] text-black/50">
                            We will contact you by email or WhatsApp to finalize your journey.
                          </p>
                        </div>

                        {/* NAME + EMAIL */}

                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <label className="text-sm font-medium text-black/75">
                              Full name

                              <input
                                className={inp}
                                autoComplete="name"
                                aria-invalid={
                                  !!errs.fullName
                                }
                                aria-describedby="fullName-e"
                                value={
                                  c.fullName
                                }
                                onChange={(e) =>
                                  setC({
                                    ...c,
                                    fullName:
                                      e.currentTarget.value,
                                  })
                                }
                                placeholder="Your full name"
                              />
                            </label>

                            {err(
                              "fullName",
                            )}
                          </div>

                          <div>
                            <label className="text-sm font-medium text-black/75">
                              Email

                              <input
                                type="email"
                                className={inp}
                                autoComplete="email"
                                aria-invalid={
                                  !!errs.email
                                }
                                aria-describedby="email-e"
                                value={
                                  c.email
                                }
                                onChange={(e) =>
                                  setC({
                                    ...c,
                                    email:
                                      e.currentTarget.value,
                                  })
                                }
                                placeholder="you@example.com"
                              />
                            </label>

                            {err(
                              "email",
                            )}
                          </div>
                        </div>

                        {/* COUNTRY + WHATSAPP */}

                        <div className="grid gap-3 sm:grid-cols-[1.05fr_1.35fr]">
                          <label className="text-sm font-medium text-black/75">
                            Country / calling code

                            <select
                              className={
                                inp
                              }
                              value={
                                c.countryIso
                              }
                              onChange={(
                                e,
                              ) => {
                                const country =
                                  e
                                    .currentTarget
                                    .value as Country;

                                setC({
                                  ...c,
                                  countryIso:
                                    country,
                                  countryCode: `+${getCountryCallingCode(
                                    country,
                                  )}`,
                                });
                              }}
                            >
                              {COUNTRY_OPTIONS.map(
                                ({
                                  country,
                                  name,
                                  code,
                                }) => (
                                  <option
                                    key={
                                      country
                                    }
                                    value={
                                      country
                                    }
                                  >
                                    {name} (
                                    {code})
                                  </option>
                                ),
                              )}
                            </select>
                          </label>

                          <div>
                            <label className="text-sm font-medium text-black/75">
                              WhatsApp number (optional)

                              <input
                                type="tel"
                                inputMode="tel"
                                aria-label="WhatsApp number"
                                className={
                                  inp
                                }
                                autoComplete="tel-national"
                                aria-invalid={
                                  !!errs.phone
                                }
                                aria-describedby="phone-e"
                                value={
                                  c.phone
                                }
                                onChange={(e) =>
                                  setC({
                                    ...c,
                                    phone:
                                      e.currentTarget.value,
                                  })
                                }
                                placeholder="912 345 678"
                              />
                            </label>

                            {err(
                              "phone",
                            )}
                          </div>
                        </div>

                        {/* CONSENT + SUBMIT */}

                        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                          <div>
                            <label
                              className="
                                flex
                                items-start
                                gap-3
                                rounded-xl
                                bg-[#f5f2e9]
                                p-3
                                text-sm
                                leading-5
                                text-black/70
                              "
                            >
                              <input
                                type="checkbox"
                                className="
                                  mt-[2px]
                                  h-5
                                  w-5
                                  shrink-0
                                  accent-[#66704f]
                                "
                                checked={
                                  c.consent
                                }
                                onChange={(
                                  e,
                                ) =>
                                  setC({
                                    ...c,
                                    consent:
                                      e
                                        .currentTarget
                                        .checked,
                                  })
                                }
                                aria-invalid={
                                  !!errs.consent
                                }
                              />

                              I agree to receive travel advice and updates from La Passion Travel.
                            </label>

                            {err(
                              "consent",
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={
                              submit
                            }
                            disabled={
                              status ===
                              "loading"
                            }
                            className="
                              w-full
                              rounded-xl
                              bg-[#cda14c]
                              px-7
                              py-3
                              font-medium
                              text-[#153e37]
                              shadow-[0_8px_22px_rgba(100,75,25,0.14)]
                              transition
                              hover:-translate-y-0.5
                              hover:bg-[#d8ad5b]
                              disabled:opacity-60

                              sm:w-auto
                              sm:min-w-[190px]
                            "
                          >
                            {status ===
                            "loading"
                              ? "Submitting…"
                              : status ===
                                  "error"
                                ? "Try again →"
                                : "Request journey →"}
                          </button>
                        </div>

                        {/* SUBMIT ERROR */}

                        {msg && (
                          <p
                            role="alert"
                            className="
                              rounded-xl
                              border
                              border-red-700/30
                              bg-red-50
                              p-3
                              text-sm
                              text-red-800
                            "
                          >
                            {msg}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* RIGHT IMAGE */}

                    <div
                      className="
                        relative
                        hidden
                        min-h-[0px]
                        overflow-hidden

                        lg:block
                      "
                    >
                      <Image
                        src="/images/journey/Danang.jpg"
                        alt="Vietnam travel"
                        fill
                        sizes="40vw"
                        className="object-cover"
                      />

                      <div
                        className="
                          absolute
                          inset-0
                          bg-gradient-to-t
                          from-[#073d38]/85
                          via-[#073d38]/15
                          to-transparent
                        "
                      />

                      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                        <p className="text-[10px] uppercase tracking-[0.32em] text-[#e0b45d]">
                          La Passion Travel
                        </p>

                        <p className="mt-3 max-w-[280px] font-serif text-[28px] leading-[1.05]">
                          Your journey starts here.
                        </p>

                        <p className="mt-3 max-w-[280px] text-[13px] leading-5 text-white/75">
                          A journey tailored to the way you want to experience Vietnam.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* ===============================================
                BOTTOM ACTION
            ================================================ */}

            {step !== 0 &&
              step !== TOTAL - 1 && (
                <div className="mt-3 flex justify-end pb-1">
                  <button
                    type="button"
                    onClick={() =>
                      setStep(
                        step + 1,
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      bg-[#cda14c]
                      px-9
                      py-3
                      font-medium
                      text-[#153e37]
                      shadow-[0_8px_22px_rgba(100,75,25,0.14)]
                      transition
                      hover:-translate-y-0.5
                      hover:bg-[#d8ad5b]

                      sm:w-auto
                    "
                  >
                    Continue →
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
    </main>
  );
}
