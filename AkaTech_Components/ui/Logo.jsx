import React from "react";
import { cn } from "@lib/utils";

export const Logo = ({ className }) => (
  // Using a text/SVG fallback for reliability in the migration
  <div className={cn("flex items-center justify-center", className)}>
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full text-akatech-gold"
      fill="currentColor"
      aria-label="AkaTech Logo"
      role="img"
    >
      <path d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0Z" fillOpacity="0.2" />
      <text
        x="50"
        y="65"
        fontSize="50"
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
      >
        A
      </text>
    </svg>
  </div>
);
