import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Us",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-[var(--space-gutter)]">
      {/* A single low point of light, so the dark reads as depth rather than emptiness */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmax] w-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, var(--moss) 0%, transparent 62%)",
        }}
      />

      <div className="rise relative w-full max-w-md">
        <p className="mb-14 text-center font-[family-name:var(--font-serif)] text-[length:var(--text-lead)] font-light italic text-[var(--color-ink-muted)]">
          You already know it.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
