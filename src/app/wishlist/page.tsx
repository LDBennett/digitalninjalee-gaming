import type { Metadata } from "next";
import { WishlistView } from "@/src/lib/frontend/pages/wishlist";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return <WishlistView />;
}
