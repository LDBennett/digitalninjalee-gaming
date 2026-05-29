"use client";

interface Props {
  text: string;
  show: boolean;
  variant: "description" | "note";
}

export function GameCardExpandable({ text, show, variant }: Props) {
  const styles =
    variant === "note"
      ? {
          wrapper: "bg-brand-950/40 border-brand-900/40",
          text: "text-brand-200",
        }
      : { wrapper: "bg-gray-800/80 border-gray-800/60", text: "text-gray-400" };

  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${show ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={`mt-2 px-3 pt-2 pb-4 border-t rounded ${styles.wrapper}`}
        >
          <p className={`text-xs leading-relaxed ${styles.text}`}>{text}</p>
        </div>
      </div>
    </div>
  );
}
