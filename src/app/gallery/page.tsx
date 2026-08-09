import type { Metadata } from "next";
import { StubPage } from "@/components/StubPage";

export const metadata: Metadata = { title: "Us — Gallery" };

export default function GalleryPage() {
  return (
    <StubPage
      eyebrow="Photos"
      title="Gallery"
      description="Our photo wall is going here. Coming soon."
    />
  );
}
