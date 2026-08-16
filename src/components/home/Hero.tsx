"use client";

import { useEffect, useRef } from "react";

type Props = {
  title: string;
  accent: string;
  tail: string;
  photo: { src: string; alt: string };
  meta: string;
  counter: string;
};

/**
 * The hero leaves as you scroll: type lifts and fades, the photograph scales
 * and darkens behind it.
 *
 * Driven from a scroll listener rather than `animation-timeline: scroll()`
 * because Safari has no scroll-driven animations and the phone is the surface
 * that matters. Only transform, opacity and filter are touched, so it stays on
 * the compositor.
 */
export function Hero({ title, accent, tail, photo, meta, counter }: Props) {
  const hero = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = hero.current;
    if (!node) return;

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let queued = false;

    const update = () => {
      queued = false;
      const p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.9)));
      node.style.setProperty("--p", p.toFixed(4));
    };

    const onScroll = () => {
      // Reduced motion leaves --p at 0, so the hero simply stays whole.
      if (queued || calm.matches) return;
      queued = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header className="hero" ref={hero}>
      <div className="hero__media">
        {/* eslint-disable-next-line @next/next/no-img-element -- images.unoptimized is set; the optimizer cannot fetch through the password gate */}
        <img src={photo.src} alt={photo.alt} />
      </div>
      <div className="hero__inner">
        <h1>
          {title} <em>{accent}</em> {tail}
        </h1>
        <div className="hero__meta">
          <span className="hero__chip">{counter}</span>
          <span>{meta}</span>
        </div>
      </div>
      <span className="scrollcue" aria-hidden="true">
        Scroll
      </span>
    </header>
  );
}
