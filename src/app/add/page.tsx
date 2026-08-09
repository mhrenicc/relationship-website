import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { AddForm } from "./AddForm";

export const metadata: Metadata = { title: "Add · Us" };

export default function AddPage() {
  return (
    <>
      <header>
        <Nav />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-[var(--space-gutter)] pb-[var(--space-movement)] pt-[clamp(2rem,1rem+4vw,4rem)]">
        <h1 className="text-[length:var(--text-display)]">Add something</h1>
        <p className="mt-4 max-w-[50ch] text-[length:var(--text-lead)] text-[var(--color-ink-soft)]">
          One photo at a time. It shows up in the gallery and on the timeline
          straight away.
        </p>

        <div className="mt-12">
          <AddForm />
        </div>
      </main>
    </>
  );
}
