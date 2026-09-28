import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Backlog Bunker - DigitalNinjaLee",
    short_name: "Backlog Bunker",
    description:
      "Personal gaming dashboard for tracking and logging games played",
    start_url: "/",
    id: "/",
    display: "standalone",
    background_color: "#030712",
    theme_color: "#030712",
    orientation: "any",
    categories: ["games", "entertainment", "utilities"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
