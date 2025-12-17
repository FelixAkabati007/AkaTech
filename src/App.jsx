import React, { useState } from "react";
import { ToastProvider } from "@components/ui/ToastProvider";
import { ScrollProgress } from "@components/ui/ScrollProgress";
import { ShowcaseNav } from "@components/ui/ShowcaseNav";
import { Navbar } from "@components/layout/Navbar";
import { Hero } from "@components/sections/Hero";
import { Services } from "@components/sections/Services";
import { Recommendations } from "@components/sections/Recommendations";
import { Pricing } from "@components/sections/Pricing";
import { Contact } from "@components/sections/Contact";
import { Dashboard } from "./pages/Dashboard";
import { Portfolio } from "./pages/Portfolio";
import { ComponentsPage } from "./pages/ComponentsPage";
import { DocsPage } from "./pages/DocsPage";
import { ThemesPage } from "./pages/ThemesPage";
import { PerformancePage } from "./pages/PerformancePage";
import { Careers } from "./pages/Careers";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { CookiePolicy } from "./pages/CookiePolicy";
import { TermsOfService } from "./pages/TermsOfService";
import { PlanCompletion } from "./pages/PlanCompletion";
import { Footer } from "@components/layout/Footer";
import { AuthModal } from "@components/ui/AuthModal";
import { useTheme } from "./hooks/useTheme";

export default function App() {
  const [view, setView] = useState("landing"); // landing | dashboard | portfolio | plan-completion | careers | privacy | cookie | terms
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { mode, cycleTheme } = useTheme();

  const handleLogin = (email, password) => {
    // Check for specific admin credentials or legacy admin email pattern
    const isAdmin = 
      (email === "JohnDoe@gmail.com" && password === "qwerty12345") || 
      email.includes("admin");

    const mockUser = {
      name: email.split("@")[0],
      email: email,
      avatar: "https://via.placeholder.com/40",
      isAdmin: isAdmin,
    };
    setUser(mockUser);
    setAuthModalOpen(false);
    setView("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setView("landing");
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

  return (
    <ToastProvider>
      <div className="font-sans antialiased">
        {view === "landing" && <ScrollProgress />}

        <Navbar
          toggleAuth={() =>
            view === "dashboard"
              ? setView("landing")
              : user
              ? setView("dashboard")
              : setAuthModalOpen(true)
          }
          isLoggedIn={!!user}
          user={user}
          mode={mode}
          cycleTheme={cycleTheme}
          onViewChange={handleNavigate}
        />

        {view === "landing" && (
          <>
            <Hero />
            <Services />
            <Recommendations />
            <Pricing onSelectPlan={handleSelectPlan} />
            <Contact />
          </>
        )}

        {view === "dashboard" && user && (
          <Dashboard user={user} onLogout={handleLogout} />
        )}

        {view === "portfolio" && <Portfolio />}
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
            onHome={() => handleNavigate("landing")}
          />
        )}

        <Footer onNavigate={handleNavigate} />

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onLogin={handleLogin}
          onSignup={handleLogin}
        />
      </div>
    </ToastProvider>
  );
}
