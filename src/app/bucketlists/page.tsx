import type { Metadata } from "next";
import Link from "next/link";
import * as repo from "@/lib/repo";
import { BucketList } from "./BucketList";
import { NewList } from "./NewList";
import "../home.css";
import "./bucketlists.css";

export const metadata: Metadata = { title: "Bucketlists · Us" };

export default async function BucketlistsPage() {
  const lists = await repo.lists.all();
  // Newest last would bury a list the moment it is made.
  const ordered = [...lists].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const items = ordered.reduce((total, list) => total + list.items.length, 0);
  const done = ordered.reduce(
    (total, list) => total + list.items.filter((item) => item.done).length,
    0,
  );

  return (
    <>
      <nav className="stuck">
        <Link className="wordmark" href="/">
          Us
        </Link>
        <div className="navlinks">
          <Link href="/trips">Trips</Link>
          <Link href="/gallery">Gallery</Link>
          <Link className="add" href="/add">
            Add
          </Link>
        </div>
      </nav>

      <main className="blwrap pad">
        <div className="sechead">
          <h1>Bucketlists</h1>
          {items > 0 && (
            <span className="blmeta">
              {done} of {items} done across {ordered.length}{" "}
              {ordered.length === 1 ? "list" : "lists"}
            </span>
          )}
        </div>

        <section className="blnewwrap">
          <NewList />
        </section>

        {ordered.length === 0 ? (
          <p className="blempty">
            No lists yet. Everything you keep meaning to do goes here — start one above.
          </p>
        ) : (
          <div className="blgrid">
            {ordered.map((list) => (
              <div key={list.id} id={list.id}>
                <BucketList list={list} />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
