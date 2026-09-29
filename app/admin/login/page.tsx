import Image from "next/image";
import { redirect } from "next/navigation";

import LoginForm from "./LoginForm";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AdminLoginPage() {
  const supabase =
    await createServerSupabaseClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (user) {
    redirect("/admin");
  }

  return (
    <main
      className="
        relative
        flex
        min-h-screen
        items-center
        justify-center
        overflow-hidden
        px-4
        py-10
      "
    >
      {/* BACKGROUND */}
      <Image
        src="/images/journey/vietnam-bg.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="
          -z-20
          object-cover
        "
      />

      <div
        className="
          absolute
          inset-0
          -z-10
          bg-[#063c36]/70
        "
      />

      {/* LOGIN CARD */}
      <div
        className="
          w-full
          max-w-[440px]
          rounded-[28px]
          border
          border-white/30
          bg-[#fdfcf8]/95
          p-7
          shadow-[0_25px_80px_rgba(0,0,0,0.3)]
          backdrop-blur-xl

          md:p-9
        "
      >
        <div className="flex justify-center">
          <div
            className="
              relative
              h-[105px]
              w-[105px]
              overflow-hidden
              rounded-full
              border
              border-[#cda14c]/50
              bg-[#123f3a]
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
        </div>

        <div className="mt-6 text-center">
          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.32em]
              text-[#a17d38]
            "
          >
            La Passion Travel
          </p>

          <h1
            className="
              mt-3
              font-serif
              text-[36px]
              leading-none
              text-[#173f39]
            "
          >
            Staff Portal
          </h1>

          <p
            className="
              mx-auto
              mt-3
              max-w-[300px]
              text-sm
              leading-6
              text-black/55
            "
          >
            Sign in to manage leads
            and customer enquiries.
          </p>
        </div>

        <LoginForm />

        <p
          className="
            mt-6
            text-center
            text-xs
            text-black/40
          "
        >
          Authorized staff only.
        </p>
      </div>
    </main>
  );
}