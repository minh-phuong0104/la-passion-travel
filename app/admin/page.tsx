import { requireStaff } from "@/lib/auth/require-staff";

export default async function AdminPage() {
  const {
    profile,
  } = await requireStaff();

  return (
    <main className="min-h-screen bg-[#f5f3ed] p-10">
      <div
        className="
          mx-auto
          max-w-5xl
          rounded-2xl
          bg-white
          p-8
          shadow-sm
        "
      >
        <p className="text-sm uppercase tracking-widest text-[#a17d38]">
          La Passion Travel
        </p>

        <h1 className="mt-3 font-serif text-4xl text-[#173f39]">
          Admin Dashboard
        </h1>

        <p className="mt-4 text-black/60">
          Signed in as{" "}
          <strong>
            {profile.email}
          </strong>
        </p>

        <p className="mt-2 text-black/60">
          Role:{" "}
          <strong>
            {profile.role}
          </strong>
        </p>
      </div>
    </main>
  );
}