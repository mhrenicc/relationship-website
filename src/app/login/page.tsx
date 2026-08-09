import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Us — Enter",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="mb-2 text-center font-[family-name:var(--font-display)] text-3xl italic text-[var(--color-terracotta)]">
          Us
        </p>
        <p className="mb-8 text-center text-sm text-[var(--color-ink-soft)]">
          This one&apos;s just for us. You know the password.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
