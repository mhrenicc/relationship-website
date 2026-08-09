import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Us",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-[var(--space-gutter)]">
      {/* Soft colour fields that blend rather than sit as shapes */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[38rem] w-[38rem] rounded-full opacity-70 blur-[120px]"
        style={{ background: "var(--rose)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -right-32 h-[42rem] w-[42rem] rounded-full opacity-60 blur-[130px]"
        style={{ background: "var(--amber)" }}
      />

      <div className="rise relative w-full max-w-md rounded-[var(--radius-lg)] bg-white/80 p-9 shadow-[var(--shadow-lift)] backdrop-blur-xl sm:p-11">
        <h1 className="font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight">
          Us
        </h1>
        <p className="mt-3 text-[length:var(--text-lead)] text-[var(--color-ink-soft)]">
          You already know it.
        </p>

        <div className="mt-9">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
