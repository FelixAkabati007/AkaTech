import React from "react";
import { LazyPreview } from "@components/ui/LazyPreview";

export const PerformancePage = () => {
  return (
    <section className="py-16 md:py-20 bg-gray-50 dark:bg-akatech-card border-t border-gray-200 dark:border-white/5">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-6">
          Performance
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Previews are lazy-mounted via IntersectionObserver. Library builds are
          tree-shakable, and animations use reduced motion when preferred.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-akatech-dark"
            >
              <LazyPreview>
                <div className="h-32 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center text-xs text-gray-500">
                  Deferred preview {i + 1}
                </div>
              </LazyPreview>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
