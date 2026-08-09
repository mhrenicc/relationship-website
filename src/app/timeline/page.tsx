import type { Metadata } from "next";
import { StubPage } from "@/components/StubPage";

export const metadata: Metadata = { title: "Us — Timeline" };

export default function TimelinePage() {
  return (
    <StubPage
      eyebrow="Our story"
      title="Timeline"
      description="This is where our milestones will live — first date, first trip, all of it. Coming soon."
    />
  );
}
