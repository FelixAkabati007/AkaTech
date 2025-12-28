import React, { useState } from "react";
import { useSyncStatus } from "@components/ui/SyncStatusProvider";

export const ConnectionStatus = () => {
  const { status } = useSyncStatus();
  const [showTooltip, setShowTooltip] = useState(false);

  const isOnline = status === "synced" || status === "syncing";
  const isConnecting = status === "connecting";

  const getStatusColor = () => {
    switch (status) {
      case "synced":
        return "#4CAF50"; // Green
      case "syncing":
        return "#2196F3"; // Blue
      case "connecting":
        return "#FFC107"; // Amber
      case "error":
      case "offline":
      default:
        return "#F44336"; // Red
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "synced":
        return "Online";
      case "syncing":
        return "Syncing...";
      case "connecting":
        return "Connecting...";
      case "error":
        return "Connection Failed";
      case "offline":
        return "Offline";
      default:
        return "Offline";
    }
  };

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
        aria-label={getStatusText()}
        className={`w-3 h-3 rounded-full transition-colors duration-300 shadow-sm ring-1 ring-white/20 cursor-help ${
          isConnecting || status === "syncing" ? "animate-pulse" : ""
        }`}
        style={{ backgroundColor: getStatusColor() }}
        data-testid="connection-status-indicator"
      />

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded shadow-lg whitespace-nowrap z-50 pointer-events-none"
          role="tooltip"
        >
          {getStatusText()}
          {/* Triangle pointer */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
        </div>
      )}
    </div>
  );
};
