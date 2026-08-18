import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import * as repo from "@/lib/repo";
import { EditSetForm } from "./EditSetForm";

export const metadata: Metadata = { title: "Edit · Us" };

export default async function EditSetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [set, trips] = await Promise.all([repo.sets.find(id), repo.trips.all()]);

  // A deleted set is reachable only from /deleted, and restoring it comes
  // first — editing something that is not on the site is a confusing place to
  // land from a stale link.
  if (!set || set.deletedAt) notFound();

  return (
    <>
      <header>
        <Nav />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-[var(--space-gutter)] pb-[var(--space-movement)] pt-[clamp(2rem,1rem+4vw,4rem)]">
        <p className="mb-4 text-[length:var(--text-meta)] text-[var(--color-ink-soft)]">
          <Link href="/" className="underline">
            ← Back
          </Link>
        </p>
        <h1 className="text-[length:var(--text-display)]">Edit this entry</h1>
        <p className="mt-4 max-w-[50ch] text-[length:var(--text-lead)] text-[var(--color-ink-soft)]">
          Change the caption or the date, move it in or out of a trip, and add
          or remove photographs.
        </p>

        <div className="mt-12">
          <EditSetForm set={set} trips={trips} />
        </div>
      </main>
    </>
  );
}
