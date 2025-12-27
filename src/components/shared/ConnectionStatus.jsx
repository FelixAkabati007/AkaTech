import React, { useState, useEffect } from "react";

export const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    // Periodic heartbeat check
    const checkConnection = async () => {
      try {
        // Using a no-cache HEAD request to the current origin
        const response = await fetch("/", {
          method: "HEAD",
          cache: "no-store",
        });

        if (response.ok) {
          setIsOnline(true);
        }
      } catch (error) {
        setIsOnline(false);
      }
    };

    // Check immediately on mount
    checkConnection();

    // Check every 30 seconds
    const intervalId = setInterval(checkConnection, 30000);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div
      className="relative flex items-center justify-center mx-2"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      data-testid="connection-status-container"
    >
      <div
        role="status"
        aria-live="polite"
        aria-label={isOnline ? "Application online" : "Application offline"}
        className={`w-3 h-3 rounded-full transition-colors duration-300 shadow-sm ring-1 ring-white/20 cursor-help`}
        style={{ backgroundColor: isOnline ? "#4CAF50" : "#F44336" }}
        data-testid="connection-status-indicator"
      />

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded shadow-lg whitespace-nowrap z-50 pointer-events-none"
          role="tooltip"
        >
          {isOnline ? "Online" : "Offline"}
          {/* Triangle pointer */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
        </div>
      )}
    </div>
  );
};
