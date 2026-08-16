import Link from "next/link";
import { Feed } from "@/components/home/Feed";
import { Hero } from "@/components/home/Hero";
import { Lists } from "@/components/home/Lists";
import { Places } from "@/components/home/Places";
import { Ribbon } from "@/components/home/Ribbon";
import { Trips } from "@/components/home/Trips";
import { LiveCounter } from "@/components/LiveCounter";
import { daysTogether } from "@/lib/days-together";
import { getFeedSets, getSets } from "@/lib/moments";
import {
  placeholderHero,
  placeholderLists,
  placeholderMilestones,
  placeholderPlaces,
  placeholderSets,
  placeholderTrips,
} from "@/lib/placeholder";
import { siteConfig } from "@/lib/site-config";
import { getPhotoStore } from "@/lib/storage";
import "./home.css";

export default async function Home() {
  const store = getPhotoStore();
  const { sets: feedSets, isPlaceholder } = await getFeedSets();
  const { sets: allSets } = await getSets();

  const [storedTrips, storedLists, storedMilestones, storedPlaces] = await Promise.all([
    store.read("trips"),
    store.read("lists"),
    store.read("milestones"),
    store.read("places"),
  ]);

  const sets = isPlaceholder ? placeholderSets : feedSets;
  const trips = isPlaceholder ? placeholderTrips : storedTrips;
  const lists = isPlaceholder ? placeholderLists : storedLists;
  const milestones = isPlaceholder ? placeholderMilestones : storedMilestones;
  const places = isPlaceholder ? placeholderPlaces : storedPlaces;

  const days = daysTogether(siteConfig.togetherSince);
  const photoCount = (isPlaceholder ? placeholderSets : allSets).reduce(
    (total, set) => total + set.photos.length,
    0,
  );

  const lead = isPlaceholder ? placeholderHero : (sets[0]?.photos[0] ?? placeholderHero);
  const heroPhoto = {
    src: "urls" in lead ? lead.urls.display : lead.src,
    alt: lead.alt,
  };

  const meta = [
    `${photoCount} photograph${photoCount === 1 ? "" : "s"}`,
    trips.length > 0 && `${trips.length} trip${trips.length === 1 ? "" : "s"}`,
    lists.length > 0 && `${lists.length} list${lists.length === 1 ? "" : "s"}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <nav>
        <Link className="wordmark" href="/">
          Us
        </Link>
        <span className="navlinks">
          <Link href="#feed">Photos</Link>
          <Link href="/trips">Trips</Link>
          <Link href="/lists">Lists</Link>
          <Link className="add" href="/add">
            Add
          </Link>
        </span>
      </nav>

      <Hero
        title={siteConfig.partnerOne}
        accent="&"
        tail={siteConfig.partnerTwo}
        photo={heroPhoto}
        meta={meta}
        counter={`${days} days`}
      />

      <main>
        <Feed sets={sets} />
        <Trips trips={trips} sets={allSets} />
        <Places places={places} />
        <Lists lists={lists} />
      </main>

      <Ribbon
        met={siteConfig.togetherSince}
        today={new Date().toISOString().slice(0, 10)}
        milestones={milestones}
      />

      <footer>
        <span>Ours, and nobody else&rsquo;s.</span>
        <span>
          <Link href="/add">Add something</Link> ·{" "}
          <LiveCounter since={siteConfig.togetherSince} initialDays={days} />
        </span>
      </footer>
    </>
  );
}
