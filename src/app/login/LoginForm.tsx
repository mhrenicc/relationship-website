"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="w-full">
      <label
        htmlFor="password"
        className="mb-2 block text-[length:var(--text-meta)] font-medium text-[var(--color-ink-soft)]"
      >
        Password
      </label>

      <input
        id="password"
        type="password"
        name="password"
        required
        autoFocus
        autoComplete="current-password"
        aria-describedby={state.error ? "password-error" : undefined}
        className="w-full rounded-[var(--radius)] border border-[var(--color-line)] bg-white px-5 py-3.5 text-lg text-[var(--color-ink)] outline-none transition-[border-color,box-shadow] duration-[var(--duration-quick)] focus:border-[var(--color-rose)] focus:shadow-[0_0_0_4px_oklch(0.56_0.22_352/0.15)]"
      />

      <div aria-live="polite" className="min-h-9">
        {state.error && (
          <p
            id="password-error"
            className="mt-3 text-[length:var(--text-meta)] font-medium text-[var(--color-rose)]"
          >
            {state.error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="grad-warm mt-2 w-full rounded-full px-6 py-4 text-lg font-semibold text-white shadow-[var(--shadow-soft)] transition-[transform,box-shadow,opacity] duration-[var(--duration-quick)] ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[var(--shadow-lift)] active:translate-y-0 disabled:opacity-60"
      >
        {isPending ? "Opening…" : "Come in"}
      </button>
    </form>
  );
}
