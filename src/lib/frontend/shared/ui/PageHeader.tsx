"use client";

import { usePathname } from "next/navigation";

interface PageConfig {
  title: string;
  staticSubtitle?: string;
  className: string;
}

const PAGE_CONFIG: Record<string, PageConfig> = {
  "/": { title: "Dashboard", className: "mb-8" },
  "/playing": { title: "Playing", className: "mb-6" },
  "/backlog": { title: "Backlog", className: "mb-6" },
  "/library": { title: "Library", className: "mb-6" },
  "/wishlist": {
    title: "Wishlist",
    staticSubtitle:
      "Games I want to buy or keep an eye on. Track upcoming releases and pre-orders.",
    className: "mb-6",
  },
};

interface Props {
  subtitle?: string;
}

export function PageHeader({ subtitle }: Props) {
  const pathname = usePathname();
  const config = PAGE_CONFIG[pathname] ?? { title: "", className: "mb-6" };
  const displaySubtitle = subtitle ?? config.staticSubtitle;

  return (
    <div className={config.className}>
      <h1 className="text-2xl font-bold text-white">{config.title}</h1>
      {displaySubtitle && (
        <p className="mt-0.5 text-sm text-gray-500">{displaySubtitle}</p>
      )}
    </div>
  );
}
