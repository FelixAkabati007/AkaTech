import React from "react";
import { cn } from "@lib/utils";

export const Logo = ({ className }) => (
  <div className={cn("flex items-center justify-center relative", className)}>
    <img
      src="/logo.png"
      alt="AkaTech Logo"
      className="w-full h-full object-contain"
      loading="eager"
    />
  </div>
);
