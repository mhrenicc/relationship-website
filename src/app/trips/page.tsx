import type { Metadata } from "next";
import { SectionShell } from "@/components/SectionShell";

export const metadata: Metadata = { title: "Trips · Us" };

export default function TripsPage() {
  return (
    <SectionShell
      title="Trips"
      intro="Every place we went, and what it was actually like."
      awaiting="No trips logged yet. Start with the one you both still bring up."
      tint="coral"
    />
  );
}
