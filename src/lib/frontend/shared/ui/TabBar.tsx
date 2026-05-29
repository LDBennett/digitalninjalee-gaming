"use client";

interface TabBarProps<T extends string> {
  tabs: T[];
  value: T;
  onChange: (tab: T) => void;
  labels: Record<T, string>;
  className?: string;
}

export function TabBar<T extends string>({
  tabs,
  value,
  onChange,
  labels,
  className = "",
}: TabBarProps<T>) {
  return (
    <div className={className}>
      {/* Mobile: dropdown */}
      <div className="sm:hidden">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="bg-gray-900 px-3 py-2 border border-gray-700 focus:border-brand-600 rounded-lg focus:outline-none w-full text-white text-sm"
        >
          {tabs.map((t) => (
            <option key={t} value={t}>
              {labels[t]}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: tabs */}
      <div className="hidden sm:flex gap-1 bg-gray-900 p-1 border border-gray-800 rounded-lg">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              value === t
                ? "bg-gray-700 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {labels[t]}
          </button>
        ))}
      </div>
    </div>
  );
}
