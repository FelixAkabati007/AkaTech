import React from "react";

export const ThemesPage = ({ mode, cycleTheme }) => {
  return (
    <section className="py-16 md:py-20 bg-white dark:bg-akatech-dark">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-6">
          Theme Customization
        </h2>
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400">
            Current:
          </span>
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-2 border border-akatech-gold/30 rounded">
            {mode}
          </span>
          <button
            onClick={cycleTheme}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-akatech-gold/30"
          >
            Cycle
          </button>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
          Themes apply globally using Tailwind’s dark class with
          time/system-aware logic. Cycle until desired mode; preference persists
          in localStorage.
        </p>
      </div>
    </section>
  );
};
