"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const supabase =
        createBrowserSupabaseClient();

      const {
        data,
        error: signInError,
      } =
        await supabase.auth.signInWithPassword(
          {
            email: email.trim(),
            password,
          },
        );

      if (
        signInError ||
        !data.user
      ) {
        setError(
          signInError?.message ||
            "Unable to sign in.",
        );

        setLoading(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong. Please try again.",
      );

      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-5"
    >
      <div>
        <label
          htmlFor="email"
          className="
            block
            text-sm
            font-medium
            text-[#183f39]
          "
        >
          Email
        </label>

        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) =>
            setEmail(
              e.currentTarget.value,
            )
          }
          placeholder="admin@lapassiontravel.com"
          className="
            mt-2
            w-full
            rounded-xl
            border
            border-black/15
            bg-white
            px-4
            py-3.5
            text-[15px]
            outline-none
            transition

            focus:border-[#b78a38]
            focus:ring-2
            focus:ring-[#b78a38]/15
          "
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="
            block
            text-sm
            font-medium
            text-[#183f39]
          "
        >
          Password
        </label>

        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) =>
            setPassword(
              e.currentTarget.value,
            )
          }
          placeholder="Enter your password"
          className="
            mt-2
            w-full
            rounded-xl
            border
            border-black/15
            bg-white
            px-4
            py-3.5
            text-[15px]
            outline-none
            transition

            focus:border-[#b78a38]
            focus:ring-2
            focus:ring-[#b78a38]/15
          "
        />
      </div>

      {error && (
        <div
          className="
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-700
          "
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="
          flex
          w-full
          items-center
          justify-center
          rounded-xl
          bg-[#cda14c]
          px-5
          py-4
          font-medium
          text-[#123f3a]
          transition

          hover:bg-[#d8ad5b]

          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {loading
          ? "Signing in..."
          : "Sign in"}
      </button>
    </form>
  );
}