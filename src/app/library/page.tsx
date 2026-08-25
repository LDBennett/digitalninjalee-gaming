import type { Metadata } from "next";
import { LibraryView } from "@/src/lib/frontend/pages/library";

export const metadata: Metadata = { title: "Library" };

export default function LibraryPage() {
  return <LibraryView />;
}
