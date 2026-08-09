import type { Metadata } from "next";
import { StubPage } from "@/components/StubPage";

export const metadata: Metadata = { title: "Us — Trips" };

export default function TripsPage() {
  return (
    <StubPage
      eyebrow="Adventures"
      title="Trips"
      description="A map and log of everywhere we've traveled together. Coming soon."
    />
  );
}
