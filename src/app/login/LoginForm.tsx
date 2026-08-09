"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-sm tracking-wide text-[var(--color-ink-soft)]">
          Password
        </span>
        <input
          type="password"
          name="password"
          required
          autoFocus
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-terracotta)]"
        />
      </label>

      {state.error && (
        <p className="text-sm text-[var(--color-terracotta)]">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-lg bg-[var(--color-terracotta)] px-4 py-3 font-medium text-[var(--color-surface)] transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out-expo)] hover:scale-[1.02] disabled:opacity-60"
      >
        {isPending ? "Checking…" : "Come in"}
      </button>
    </form>
  );
}
