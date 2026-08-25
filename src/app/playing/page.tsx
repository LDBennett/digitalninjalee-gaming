import type { Metadata } from "next";
import { PlayingView } from "@/src/lib/frontend/pages/playing";

export const metadata: Metadata = { title: "Currently Playing" };

export default function PlayingPage() {
  return <PlayingView />;
}
