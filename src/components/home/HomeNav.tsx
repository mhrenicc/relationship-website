"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/**
 * The bar sits transparent over the hero photograph and only takes on its
 * light surface once the hero is genuinely gone. Switching earlier leaves
 * ink-coloured links sitting on the photograph, which is unreadable.
 */
export function HomeNav() {
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = nav.current;
    const hero = document.querySelector(".hero");
    if (!node || !hero) return;

    // IntersectionObserver rather than a scroll listener: it fires without a
    // rendered frame, costs nothing while the hero is on screen, and cannot
    // wedge the way a rAF-throttled handler can if a frame never arrives.
    //
    // `top < 0` distinguishes "scrolled past the hero" from "hero not reached
    // yet" — both are non-intersecting, and only the first should stick.
    const observer = new IntersectionObserver(
      ([entry]) => {
        node.classList.toggle(
          "stuck",
          !entry.isIntersecting && entry.boundingClientRect.top < 0,
        );
      },
      { threshold: 0 },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <nav ref={nav}>
      <Link className="wordmark" href="/">
        Us
      </Link>
      <span className="navlinks">
        <Link href="#feed">Photos</Link>
        <Link href="/trips">Trips</Link>
        <Link href="/bucketlists">Bucketlists</Link>
        <Link className="add" href="/add">
          Add
        </Link>
      </span>
    </nav>
  );
}
