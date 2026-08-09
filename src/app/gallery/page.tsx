import type { Metadata } from "next";
import { SectionShell } from "@/components/SectionShell";

export const metadata: Metadata = { title: "Gallery · Us" };

export default function GalleryPage() {
  return (
    <SectionShell
      title="Gallery"
      intro="The photographs worth keeping, not all of them."
      awaiting="Empty for now. This works better with thirty good photographs than three hundred ordinary ones."
    />
  );
}
