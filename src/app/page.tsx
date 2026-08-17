import Link from "next/link";
import { Feed } from "@/components/home/Feed";
import { Hero } from "@/components/home/Hero";
import { HomeNav } from "@/components/home/HomeNav";
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
import { readLive } from "@/lib/records";
import { siteConfig } from "@/lib/site-config";
import { photoSrc } from "@/lib/storage/variants";
import "./home.css";

export default async function Home() {
  const { sets: feedSets } = await getFeedSets();
  const { sets: allSets } = await getSets();

  const [storedTrips, storedLists, storedMilestones, storedPlaces] = await Promise.all([
    readLive("trips"),
    readLive("lists"),
    readLive("milestones"),
    readLive("places"),
  ]);

  // Placeholder-ness is decided per collection, not globally. Adding the first
  // real place while there are still no photographs must show that place —
  // deciding it from sets alone made real content invisible.
  const fallback = <T,>(stored: T[], placeholder: T[]) =>
    stored.length > 0 ? stored : placeholder;

  const sets = fallback(feedSets, placeholderSets);
  const trips = fallback(storedTrips, placeholderTrips);
  const lists = fallback(storedLists, placeholderLists);
  const milestones = fallback(storedMilestones, placeholderMilestones);
  const places = fallback(storedPlaces, placeholderPlaces);

  const days = daysTogether(siteConfig.togetherSince);
  const photoCount = fallback(allSets, placeholderSets).reduce(
    (total, set) => total + set.photos.length,
    0,
  );

  // The newest set's lead photograph opens the site; the stock hero only
  // stands in until something real exists.
  const lead = sets[0]?.photos[0];
  const heroPhoto = lead
    ? { src: photoSrc(lead, "full"), alt: lead.alt }
    : { src: placeholderHero.src, alt: placeholderHero.alt };

  const meta = [
    `${photoCount} photograph${photoCount === 1 ? "" : "s"}`,
    trips.length > 0 && `${trips.length} trip${trips.length === 1 ? "" : "s"}`,
    lists.length > 0 && `${lists.length} list${lists.length === 1 ? "" : "s"}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <HomeNav />

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
          <Link href="/deleted">Recently deleted</Link> ·{" "}
          <LiveCounter since={siteConfig.togetherSince} initialDays={days} />
        </span>
      </footer>
    </>
  );
}
