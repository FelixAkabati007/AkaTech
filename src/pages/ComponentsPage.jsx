import React from "react";
import { Navbar } from "@components/layout/Navbar";
import { ScrollProgress } from "@components/ui/ScrollProgress";
import { Logo } from "@components/ui/Logo";
import { ToastProvider } from "@components/ui/ToastProvider";
import { Icons } from "@components/ui/Icons";
import { LazyPreview } from "@components/ui/LazyPreview";

export const ComponentsPage = () => {
  return (
    <section className="py-16 md:py-20 bg-white dark:bg-akatech-dark transition-colors">
      <div className="container mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white">
            Component Showcase
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Live previews of key UI elements with responsive layouts.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-akatech-card">
            <h3 className="font-bold mb-3 text-gray-900 dark:text-white text-sm">
              Navbar
            </h3>
            <LazyPreview>
              <div className="relative h-40 overflow-hidden rounded-lg border border-gray-200 dark:border-white/10">
                <Navbar
                  toggleAuth={() => {}}
                  isLoggedIn={false}
                  user={null}
                  mode={"light"}
                  cycleTheme={() => {}}
                  onViewChange={() => {}}
                  logo={
                    <Logo
                      src="Gemini_Generated_Image_2fvol02fvol02fvo.jpg"
                      className="w-8 h-8"
                    />
                  }
                  icons={{
                    Sun: (p) => <Icons.Sun {...p} />,
                    Moon: (p) => <Icons.Moon {...p} />,
                    Monitor: (p) => <Icons.Monitor {...p} />,
                    Menu: (p) => <Icons.Menu {...p} />,
                    X: (p) => <Icons.X {...p} />,
                  }}
                />
              </div>
            </LazyPreview>
            <pre className="mt-4 text-[11px] bg-black/80 text-white p-3 rounded overflow-auto">
              <code>{`<Navbar mode="light" isLoggedIn={false} />`}</code>
            </pre>
          </div>
          <div className="p-6 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-akatech-card">
            <h3 className="font-bold mb-3 text-gray-900 dark:text-white text-sm">
              Scroll Progress
            </h3>
            <LazyPreview>
              <div className="relative h-28 rounded-lg border border-gray-200 dark:border-white/10">
                <ScrollProgress />
                <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
                  Scroll to see progress
                </div>
              </div>
            </LazyPreview>
            <pre className="mt-4 text-[11px] bg-black/80 text-white p-3 rounded overflow-auto">
              <code>{`<ScrollProgress />`}</code>
            </pre>
          </div>
          <div className="p-6 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-akatech-card">
            <h3 className="font-bold mb-3 text-gray-900 dark:text-white text-sm">
              Logo
            </h3>
            <LazyPreview>
              <div className="flex items-center justify-center h-28 rounded-lg border border-gray-200 dark:border-white/10">
                <Logo
                  src="Gemini_Generated_Image_2fvol02fvol02fvo.jpg"
                  className="w-20 h-20"
                />
              </div>
            </LazyPreview>
            <pre className="mt-4 text-[11px] bg-black/80 text-white p-3 rounded overflow-auto">
              <code>{`<Logo src="..." className="w-20 h-20" />`}</code>
            </pre>
          </div>
          <div className="p-6 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-akatech-card">
            <h3 className="font-bold mb-3 text-gray-900 dark:text-white text-sm">
              Toast Provider
            </h3>
            <LazyPreview>
              <div className="h-28 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center text-xs text-gray-500">
                <ToastProvider>
                  <span>Wrap your app to enable toasts</span>
                </ToastProvider>
              </div>
            </LazyPreview>
            <pre className="mt-4 text-[11px] bg-black/80 text-white p-3 rounded overflow-auto">
              <code>{`<ToastProvider>{children}</ToastProvider>`}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};
