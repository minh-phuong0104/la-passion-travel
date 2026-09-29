import Link from "next/link";

import { logout } from "@/app/admin/actions";

type Props = {
  name: string;
  role: "admin" | "sales";
};

export function AdminHeader({
  name,
  role,
}: Props) {
  return (
    <header className="border-b border-forest/10 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          href="/admin"
          className="flex items-center gap-3 text-forest"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-forest font-serif text-xl text-cream">
            L
          </span>

          <span className="leading-tight">
            <span className="block font-serif text-xl font-semibold">
              La Passion
            </span>

            <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-olive">
              Sales workspace
            </span>
          </span>
        </Link>

        <nav className="order-3 flex w-full items-center gap-1 sm:order-none sm:w-auto">
          <Link
            href="/admin"
            className="rounded-full px-4 py-2 text-sm font-medium text-forest transition hover:bg-cream"
          >
            Dashboard
          </Link>

          <Link
            href="/admin/leads"
            className="rounded-full px-4 py-2 text-sm font-medium text-forest transition hover:bg-cream"
          >
            Leads
          </Link>

          <Link
            href="/admin/itineraries"
            className="rounded-full px-4 py-2 text-sm font-medium text-forest transition hover:bg-cream"
          >
            Itineraries
          </Link>
        </nav>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-ink">
              {name}
            </p>

            <p className="text-xs capitalize text-olive">
              {role}
            </p>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-forest/20 px-4 py-2 text-sm font-medium text-forest transition hover:bg-cream"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
