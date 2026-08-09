"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="w-full">
      <label htmlFor="password" className="sr-only">
        Password
      </label>

      <input
        id="password"
        type="password"
        name="password"
        required
        autoFocus
        autoComplete="current-password"
        placeholder="…"
        aria-describedby={state.error ? "password-error" : undefined}
        className="w-full border-0 border-b border-[var(--line)] bg-transparent pb-4 text-center font-[family-name:var(--font-serif)] text-[var(--text-title)] font-light tracking-[0.2em] text-[var(--color-ink)] outline-none transition-colors duration-[var(--duration-quick)] placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-lichen)]"
      />

      <div className="mt-6 flex min-h-6 items-center justify-center">
        {state.error ? (
          <p
            id="password-error"
            role="alert"
            className="text-[length:var(--text-meta)] text-[var(--color-ink-muted)]"
          >
            {state.error}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-full py-3 text-[length:var(--text-meta)] uppercase tracking-[0.28em] text-[var(--color-ink-muted)] transition-colors duration-[var(--duration-quick)] hover:text-[var(--color-lichen)] disabled:opacity-50"
      >
        {isPending ? "Opening" : "Enter"}
      </button>
    </form>
  );
}
