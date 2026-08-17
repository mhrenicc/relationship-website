"use client";

import { useActionState } from "react";
import { addList, type ListState } from "@/app/lists-actions";

export function NewList() {
  const [state, formAction, isPending] = useActionState<ListState, FormData>(addList, {});

  return (
    <>
      {/* Remounted on each success so the field clears itself. */}
      <form key={state.added ?? "new"} action={formAction} className="bl__new">
        <input
          name="name"
          required
          maxLength={80}
          placeholder="Places to swim, films to argue about…"
          aria-label="Name the new list"
        />
        <button type="submit" disabled={isPending}>
          {isPending ? "Making…" : "Start a list"}
        </button>
      </form>

      <div aria-live="polite">
        {state.error && (
          <p role="alert" className="bl__err">
            {state.error}
          </p>
        )}
      </div>
    </>
  );
}
