import type { Metadata } from "next";
import { SectionShell } from "@/components/SectionShell";

export const metadata: Metadata = { title: "Timeline · Us" };

export default function TimelinePage() {
  return (
    <SectionShell
      title="Timeline"
      intro="Everything that happened, in the order it happened."
      awaiting="Nothing here yet. The first entry is the day you met, and you already know the date."
    />
  );
}
