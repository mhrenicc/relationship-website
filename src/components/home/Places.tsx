import { geoNaturalEarth1 } from "d3-geo";
import type { StoredPlace } from "@/lib/storage";
import { WORLD_PATHS, WORLD_VIEWBOX } from "@/lib/world-paths";
import { PlacesRail } from "./PlacesRail";

/**
 * Pins are projected with the same projection the coastlines were rendered
 * with, so alignment is exact by construction rather than by calibration.
 * Two stock world maps were tried first and both were wrong — one put
 * Gibraltar in Algeria.
 *
 * Projection runs on the server; the client only ever receives x/y
 * percentages, so d3 never reaches the browser.
 */
export function Places({ places }: { places: StoredPlace[] }) {
  if (places.length === 0) return null;

  const project = geoNaturalEarth1().fitSize(
    [WORLD_VIEWBOX.width, WORLD_VIEWBOX.height],
    { type: "Sphere" },
  );

  const pins = places
    .filter((place) => place.lat !== null && place.lon !== null)
    .map((place) => {
      const point = project([place.lon as number, place.lat as number]);
      if (!point) return null;
      return {
        id: place.id,
        name: place.name,
        been: place.been,
        x: (point[0] / WORLD_VIEWBOX.width) * 100,
        y: (point[1] / WORLD_VIEWBOX.height) * 100,
      };
    })
    .filter((pin): pin is NonNullable<typeof pin> => pin !== null);

  const been = places.filter((place) => place.been).length;

  return (
    <section className="places places--attached pad" id="places">
      <p className="eyebrow2">
        Everywhere we have been · {been} been · {places.length - been} to go
      </p>

      <div className="placesgrid">
        <div className="map">
          <svg
            viewBox={`0 0 ${WORLD_VIEWBOX.width} ${WORLD_VIEWBOX.height}`}
            role="img"
            aria-label={`World map. ${been} places visited, ${places.length - been} still to go.`}
          >
            <g className="land">
              {WORLD_PATHS.map((d, index) => (
                <path key={index} d={d} />
              ))}
            </g>
          </svg>
          {pins.map((pin) => (
            <span
              key={pin.id}
              className={`pin${pin.been ? " been" : ""}`}
              data-place={pin.id}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            >
              <i />
              <b>{pin.name}</b>
            </span>
          ))}
        </div>

        <PlacesRail places={places} />
      </div>
    </section>
  );
}
