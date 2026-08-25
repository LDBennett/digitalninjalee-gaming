import type { Metadata } from "next";
import { BacklogView } from "@/src/lib/frontend/pages/backlog";

export const metadata: Metadata = { title: "Backlog" };

export default function BacklogPage() {
  return <BacklogView />;
}
