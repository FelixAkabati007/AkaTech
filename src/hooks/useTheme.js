import { useState, useEffect } from "react";

const NIGHT_START_HOUR = 19; // 7:00 PM
const DAY_START_HOUR = 6; // 6:00 AM

export const useTheme = () => {
  const [mode, setMode] = useState("system"); // 'system', 'light', 'dark'
  const [mounted, setMounted] = useState(false);

  // Load saved preference
  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("akatech-theme");
    if (storedTheme) {
      setMode(storedTheme);
    }
  }, []);

  // Apply theme logic
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      let isDark = false;

      if (mode === "system") {
        // Time-based check
        const hour = new Date().getHours();
        const isNight = hour >= NIGHT_START_HOUR || hour < DAY_START_HOUR;

        // System preference check
        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;

        // Logic: Dark if it's night OR if system prefers dark
        isDark = isNight || systemPrefersDark;
      } else {
        isDark = mode === "dark";
      }

      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    applyTheme();

    // Listen for system changes if in auto mode
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      if (mode === "system") applyTheme();
    };
    mediaQuery.addEventListener("change", handleSystemChange);

    // Poll for time changes (every minute)
    const interval = setInterval(() => {
      if (mode === "system") applyTheme();
    }, 60000);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemChange);
      clearInterval(interval);
    };
  }, [mode]);

  const cycleTheme = () => {
    const modes = ["system", "light", "dark"];
    const nextMode = modes[(modes.indexOf(mode) + 1) % modes.length];
    setMode(nextMode);
    localStorage.setItem("akatech-theme", nextMode);
  };

  return { mode, cycleTheme, mounted };
};
