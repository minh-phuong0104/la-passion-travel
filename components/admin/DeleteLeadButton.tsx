"use client";

import { deleteLead } from "@/app/admin/leads/[id]/actions";

export function DeleteLeadButton({
  id,
}: {
  id: string;
}) {
  return (
    <form
      action={deleteLead}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Delete this lead permanently? This cannot be undone.",
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-lg border border-red-400/25 bg-red-500/10 px-3.5 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/20"
      >
        Delete
      </button>
    </form>
  );
}
