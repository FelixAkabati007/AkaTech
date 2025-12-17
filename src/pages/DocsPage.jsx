import React from "react";

export const DocsPage = () => {
  return (
    <section className="py-16 md:py-20 bg-gray-50 dark:bg-akatech-card border-t border-gray-200 dark:border-white/5">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-6">
          Usage Documentation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-white dark:bg-akatech-dark rounded-xl border border-gray-200 dark:border-white/10">
            <h3 className="font-bold text-sm mb-3 text-gray-900 dark:text-white">
              Navbar Props
            </h3>
            <pre className="text-[11px] bg-black/80 text-white p-3 rounded overflow-auto">
              <code>{`interface NavbarProps {
  toggleAuth: () => void;
  isLoggedIn: boolean;
  user?: { name?: string; avatar?: string } | null;
  mode: 'system' | 'light' | 'dark';
  cycleTheme: () => void;
  onViewChange: (view: 'landing' | 'portfolio') => void;
  icons?: { Sun?: Comp; Moon?: Comp; Monitor?: Comp; Menu?: Comp; X?: Comp };
  logo?: React.ReactNode;
}`}</code>
            </pre>
          </div>
          <div className="p-6 bg-white dark:bg-akatech-dark rounded-xl border border-gray-200 dark:border-white/10">
            <h3 className="font-bold text-sm mb-3 text-gray-900 dark:text-white">
              ScrollProgress
            </h3>
            <pre className="text-[11px] bg-black/80 text-white p-3 rounded overflow-auto">
              <code>{`<ScrollProgress className="fixed top-0" />`}</code>
            </pre>
          </div>
          <div className="p-6 bg-white dark:bg-akatech-dark rounded-xl border border-gray-200 dark:border-white/10">
            <h3 className="font-bold text-sm mb-3 text-gray-900 dark:text-white">
              Logo
            </h3>
            <pre className="text-[11px] bg-black/80 text-white p-3 rounded overflow-auto">
              <code>{`<Logo src="/path/logo.png" alt="Brand" className="w-12 h-12" />`}</code>
            </pre>
          </div>
          <div className="p-6 bg-white dark:bg-akatech-dark rounded-xl border border-gray-200 dark:border-white/10">
            <h3 className="font-bold text-sm mb-3 text-gray-900 dark:text-white">
              ToastProvider
            </h3>
            <pre className="text-[11px] bg-black/80 text-white p-3 rounded overflow-auto">
              <code>{`<ToastProvider>{children}</ToastProvider>`}</code>
            </pre>
            <p className="text-[12px] mt-3 text-gray-600 dark:text-gray-400">
              Note: Use your app's toast hook or callbacks to trigger messages.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
