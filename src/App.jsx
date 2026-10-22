import React, { useState, useEffect, Suspense, lazy } from "react";
import { ToastProvider } from "@components/ui/ToastProvider";
import { SyncStatusProvider } from "@components/ui/SyncStatusProvider";
import toast, { Toaster } from "react-hot-toast";
import { ScrollProgress } from "@components/ui/ScrollProgress";
import { ShowcaseNav } from "@components/ui/ShowcaseNav";
import { Navbar } from "@components/layout/Navbar";
import { Hero } from "@components/sections/Hero";
import { Services } from "@components/sections/Services";
import { Recommendations } from "@components/sections/Recommendations";
import { Pricing } from "@components/sections/Pricing";
import { Contact } from "@components/sections/Contact";
import { Footer } from "@components/layout/Footer";
import { AuthModal } from "@components/ui/AuthModal";
import { FloatingAssistant } from "@components/ui/FloatingAssistant";
import { CookieConsent } from "@components/ui/CookieConsent";
import AdinkraBackground from "@components/ui/AdinkraBackground";
import { useTheme } from "./hooks/useTheme";
import { Analytics } from "@vercel/analytics/react";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("App section failed to render:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-white px-6 py-24 text-gray-900 dark:bg-akatech-black dark:text-white">
          <div className="mx-auto max-w-2xl rounded-lg border border-akatech-gold/30 bg-white/90 p-8 shadow-xl dark:bg-akatech-card">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-akatech-gold">
              Preview recovered
            </p>
            <h1 className="mb-4 text-3xl font-serif">
              This section could not load.
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              The rest of the site is still available. Refresh the page after
              checking the browser console or local configuration.
            </p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

// Lazy load pages
const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard }))
);
const About = lazy(() =>
  import("./pages/About").then((module) => ({ default: module.About }))
);
const ComponentsPage = lazy(() =>
  import("./pages/ComponentsPage").then((module) => ({
    default: module.ComponentsPage,
  }))
);
const DocsPage = lazy(() =>
  import("./pages/DocsPage").then((module) => ({ default: module.DocsPage }))
);
const ThemesPage = lazy(() =>
  import("./pages/ThemesPage").then((module) => ({
    default: module.ThemesPage,
  }))
);
const PerformancePage = lazy(() =>
  import("./pages/PerformancePage").then((module) => ({
    default: module.PerformancePage,
  }))
);
const Careers = lazy(() =>
  import("./pages/Careers").then((module) => ({ default: module.Careers }))
);
const PrivacyPolicy = lazy(() =>
  import("./pages/PrivacyPolicy").then((module) => ({
    default: module.PrivacyPolicy,
  }))
);
const CookiePolicy = lazy(() =>
  import("./pages/CookiePolicy").then((module) => ({
    default: module.CookiePolicy,
  }))
);
const TermsOfService = lazy(() =>
  import("./pages/TermsOfService").then((module) => ({
    default: module.TermsOfService,
  }))
);
const PlanCompletion = lazy(() =>
  import("./pages/PlanCompletion").then((module) => ({
    default: module.PlanCompletion,
  }))
);

export default function App() {
  const [view, setView] = useState("landing"); // landing | dashboard | portfolio | plan-completion | careers | privacy | cookie | terms
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const [resetToken, setResetToken] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isGoogleAuthAvailable, setIsGoogleAuthAvailable] = useState(true);
  const { mode, cycleTheme } = useTheme();

  const clearAuthQueryParams = () => {
    const url = new URL(window.location.href);
    ["auth", "reason", "redirectView", "redirectRoute"].forEach((param) =>
      url.searchParams.delete(param)
    );
    window.history.replaceState({}, "", url.toString());
  };

  const routeAuthenticatedUser = (authPayload, source = "auth") => {
    const nextUser = authPayload?.user;
    if (!nextUser?.email) {
      setUser(null);
      setAuthModalOpen(false);
      setView("landing");
      toast.error("Authentication completed, but no user email was returned.");
      return;
    }

    const redirectView =
      authPayload.redirectView === "dashboard" ? "dashboard" : "landing";

    setUser(nextUser);
    setAuthModalOpen(false);
    setView(redirectView);
    window.scrollTo(0, 0);

    if (import.meta.env.DEV) {
      const maskedEmail = nextUser.email.replace(/^(.{2}).*(@.*)$/, "$1***$2");
      console.info("Auth route resolved", {
        source,
        email: maskedEmail,
        role: nextUser.role || "client",
        redirectView,
        redirectRoute:
          authPayload.redirectRoute ||
          (nextUser.role === "admin" ? "admin" : "client"),
      });
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleAuthResult = params.get("auth");

    if (googleAuthResult === "google-error") {
      setUser(null);
      setView("landing");
      toast.error("Google sign-in failed. Please try again or use email.");
      clearAuthQueryParams();
      return;
    }

    fetch("/api/auth/me", {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Session expired");
      })
      .then((data) => {
        if (googleAuthResult === "google-success") {
          routeAuthenticatedUser(data, "google_oauth_callback");
          toast.success("Signed in with Google");
          clearAuthQueryParams();
        } else {
          setUser(data.user);
        }
      })
      .catch(() => {
        setUser(null);
        if (googleAuthResult === "google-success") {
          setView("landing");
          toast.error("Google sign-in completed, but the session was not found.");
          clearAuthQueryParams();
        }
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("resetToken");
    if (token) {
      setResetToken(token);
      setAuthModalMode("reset");
      setAuthModalOpen(true);
    }
  }, []);

  useEffect(() => {
    fetch("/api/auth/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((config) => {
        setIsGoogleAuthAvailable(Boolean(config?.googleAuthAvailable));
      })
      .catch(() => {
        setIsGoogleAuthAvailable(false);
      });
  }, []);

  const handleLogin = (email, password) => {
    return fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || errData.message || "Login failed");
        }
        return res.json();
      })
      .then((data) => {
        routeAuthenticatedUser(data, "email_password_login");
      });
  };

  const handleSignup = ({ name, email, password }) => {
    return fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        accountType: "neon",
      }),
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || data.message || "Signup failed");
        }
        return data;
      })
      .then((data) => {
        routeAuthenticatedUser(data, "email_password_signup");
      });
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    fetch("/api/logout", { method: "POST" })
      .then(() => {
        setUser(null);
        setView("landing");
      })
      .catch((err) => console.error("Logout failed", err));
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setView("plan-completion");
    window.scrollTo(0, 0);
  };

  const handleNavigate = (newView) => {
    setView(newView);
    window.scrollTo(0, 0);
    if (newView !== "plan-completion") setSelectedPlan(null);
  };

  const handleGoogleLogin = ({ mode = "login" } = {}) => {
    const params = new URLSearchParams({ mode });
    window.location.assign(`/api/auth/google/start?${params.toString()}`);
  };

  const handleRequestPasswordReset = (email) => {
    return fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Unable to request password reset");
      }
      return data;
    });
  };

  const handleResetPassword = ({ token, password }) => {
    return fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "Unable to reset password");
        }
        return data;
      })
      .then((data) => {
        setResetToken(null);
        const url = new URL(window.location.href);
        url.searchParams.delete("resetToken");
        window.history.replaceState({}, "", url.toString());
        return data;
      });
  };

  const appContent = (
    <div className={`min-h-screen ${mode} transition-colors duration-300`}>
      <Analytics />
      <ToastProvider>
        <SyncStatusProvider>
          <AppErrorBoundary>
            <div className="bg-white dark:bg-akatech-black text-gray-900 dark:text-white min-h-screen transition-colors duration-300">
              {/* <AdinkraBackground /> */}
              <img
                src="/background-accent.jpg"
                alt=""
                className="fixed bottom-0 left-0 pointer-events-none w-[300px] md:w-[500px] opacity-100 z-0"
              />
              {view === "landing" && <ScrollProgress />}
              {view !== "dashboard" && (
                <Navbar
                  toggleAuth={() =>
                    view === "dashboard"
                      ? setView("landing")
                      : user
                      ? setView("dashboard")
                      : (setAuthModalMode("login"), setAuthModalOpen(true))
                  }
                  isLoggedIn={!!user}
                  user={user}
                  mode={mode}
                  cycleTheme={cycleTheme}
                  onViewChange={handleNavigate}
                />
              )}
              {view === "landing" && (
                <>
                  <Hero />
                  <Services />
                  <Recommendations />
                  <Pricing onSelectPlan={handleSelectPlan} />
                  <Contact />
                </>
              )}
              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-akatech-dark">
                    <div className="w-12 h-12 border-4 border-akatech-gold border-t-transparent rounded-full animate-spin"></div>
                  </div>
                }
              >
                {view === "dashboard" && user && (
                  <Dashboard
                    user={user}
                    onLogout={handleLogout}
                    onUserUpdate={handleUserUpdate}
                  />
                )}

                {view === "about" && <About />}
                {view === "components" && <ComponentsPage />}
                {view === "docs" && <DocsPage />}
                {view === "themes" && (
                  <ThemesPage mode={mode} cycleTheme={cycleTheme} />
                )}
                {view === "performance" && <PerformancePage />}

                {view === "careers" && (
                  <Careers onHome={() => handleNavigate("landing")} />
                )}

                {view === "privacy" && (
                  <PrivacyPolicy onHome={() => handleNavigate("landing")} />
                )}

                {view === "cookie" && (
                  <CookiePolicy onHome={() => handleNavigate("landing")} />
                )}

                {view === "terms" && (
                  <TermsOfService onHome={() => handleNavigate("landing")} />
                )}

                {view === "plan-completion" && selectedPlan && (
                  <PlanCompletion
                    plan={selectedPlan}
                    onBack={() => handleNavigate("landing")}
                    onNavigate={handleNavigate}
                    onUserUpdate={handleUserUpdate}
                  />
                )}
              </Suspense>
              {view !== "dashboard" && <Footer onNavigate={handleNavigate} />}
              {view === "landing" && (
                <Suspense fallback={null}>
                  <FloatingAssistant />
                </Suspense>
              )}
              <CookieConsent />
              <AuthModal
                isOpen={authModalOpen}
                onClose={() => {
                  setAuthModalOpen(false);
                  if (resetToken) {
                    setResetToken(null);
                    const url = new URL(window.location.href);
                    url.searchParams.delete("resetToken");
                    window.history.replaceState({}, "", url.toString());
                  }
                }}
                onLogin={handleLogin}
                onSignup={handleSignup}
                onGoogleLogin={handleGoogleLogin}
                onGoogleUnavailable={() => setIsGoogleAuthAvailable(false)}
                onRequestPasswordReset={handleRequestPasswordReset}
                onResetPassword={handleResetPassword}
                resetToken={resetToken}
                initialMode={authModalMode}
                isGoogleAuthAvailable={isGoogleAuthAvailable}
              />
              <Toaster position="top-center" />
            </div>
          </AppErrorBoundary>
        </SyncStatusProvider>
      </ToastProvider>
    </div>
  );

  return appContent;
}
