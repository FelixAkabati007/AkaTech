import React from "react";

export const ShowcaseNav = ({ onNavigate, active }) => {
  const items = [
    { key: "components", label: "Components" },
    { key: "docs", label: "Docs" },
    { key: "themes", label: "Themes" },
    { key: "performance", label: "Performance" },
  ];
  return (
    <div className="sticky top-16 z-40 bg-white/80 dark:bg-akatech-dark/80 backdrop-blur border-t border-b border-gray-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`px-3 py-2 text-[11px] font-bold uppercase tracking-widest rounded border transition ${
              active === item.key
                ? "bg-gold-gradient text-black"
                : "border-akatech-gold/30 text-gray-700 dark:text-gray-300 hover:bg-akatech-gold/10"
            }`}
            aria-current={active === item.key ? "page" : undefined}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
