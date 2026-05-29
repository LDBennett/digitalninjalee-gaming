"use client";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search games…",
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="focus:border-brand-600 w-full rounded-lg border border-gray-700 bg-gray-900 py-2 pr-8 pl-9 text-sm text-white placeholder-gray-500 focus:outline-none"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-lg leading-none text-gray-500 transition-colors hover:text-white"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}
