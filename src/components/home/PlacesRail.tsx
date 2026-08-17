"use client";

import { useActionState, useState, useTransition } from "react";
import { addPlace, deletePlace, togglePlace, type PlaceState } from "@/app/places-actions";
import type { StoredPlace } from "@/lib/storage";

type Filter = "all" | "been" | "want";

/**
 * Hovering or tab-focusing an entry pulses its pin. The pins are rendered by
 * the server component alongside the map; this reaches them by data attribute
 * rather than lifting the whole map into the client.
 */
export function PlacesRail({ places }: { places: StoredPlace[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [confirming, setConfirming] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [state, formAction] = useActionState<PlaceState, FormData>(addPlace, {});

  const shown = places.filter((place) =>
    filter === "all" ? true : (filter === "been") === place.been,
  );

  const highlight = (id: string, on: boolean) => {
    document.querySelector(`.pin[data-place="${id}"]`)?.classList.toggle("on", on);
  };

  return (
    <div className="rail">
      <div className="rail__top">
        {(["all", "been", "want"] as const).map((option) => (
          <button
            key={option}
            type="button"
            className="chip"
            aria-pressed={filter === option}
            onClick={() => setFilter(option)}
          >
            {option === "all" ? "All" : option === "been" ? "Been" : "Want to go"}
          </button>
        ))}
      </div>

      <ul>
        {shown.map((place) => (
          <li key={place.id} className={place.been ? "been" : undefined}>
            <button
              type="button"
              className="railrow"
              disabled={pending}
              aria-label={
                place.been
                  ? `Mark ${place.name} as not visited`
                  : `Mark ${place.name} as visited`
              }
              onClick={() => startTransition(() => void togglePlace(place.id))}
              onMouseEnter={() => highlight(place.id, true)}
              onMouseLeave={() => highlight(place.id, false)}
              onFocus={() => highlight(place.id, true)}
              onBlur={() => highlight(place.id, false)}
            >
              <span className="dot" />
              <span className="nm">
                {place.name}
                <span className="cty">
                  {place.lat === null ? "Needs a location" : place.country}
                </span>
              </span>
              <span className="tick">{place.been ? "✓" : "+"}</span>
            </button>

            {/* A sibling of the toggle, not inside it — the whole row is
                already a button, and buttons do not nest. */}
            {confirming === place.id ? (
              <span className="raildel__ask">
                <button
                  type="button"
                  className="raildel__yes"
                  disabled={pending}
                  onClick={() => {
                    startTransition(() => void deletePlace(place.id));
                    setConfirming(null);
                  }}
                >
                  Delete
                </button>
                <button type="button" onClick={() => setConfirming(null)}>
                  Keep
                </button>
              </span>
            ) : (
              <button
                type="button"
                className="raildel"
                aria-label={`Delete ${place.name}`}
                title={`Delete ${place.name}`}
                onClick={() => setConfirming(place.id)}
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>

      <form className="addplace" action={formAction}>
        <input type="text" name="name" placeholder="Add a place…" aria-label="Add a place" />
        <button type="submit">Add</button>
      </form>

      {state.error && (
        <p role="alert" className="railerror">
          {state.error}
        </p>
      )}
    </div>
  );
}
