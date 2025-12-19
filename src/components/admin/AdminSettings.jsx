import React, { useState } from "react";
import { Icons } from "@components/ui/Icons";

export const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: "AkaTech IT Solutions",
    emailNotifications: true,
    maintenanceMode: false,
    theme: "light",
    adminEmail: "admin@akatech.com",
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif text-gray-900 dark:text-white">
          System Settings
        </h2>
        <button className="bg-akatech-gold text-white px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-akatech-goldDark transition-colors flex items-center gap-2 shadow-lg shadow-akatech-gold/20">
          <Icons.CheckCircle className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white dark:bg-akatech-card p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-akatech-gold/10 rounded-lg">
              <Icons.Settings className="w-6 h-6 text-akatech-gold" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              General Configuration
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleChange("siteName", e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-akatech-gold outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={settings.adminEmail}
                onChange={(e) => handleChange("adminEmail", e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-akatech-gold outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Notifications & System */}
        <div className="bg-white dark:bg-akatech-card p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Icons.Bell className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Notifications & System
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Email Notifications
                </p>
                <p className="text-xs text-gray-500">
                  Receive updates on new tickets
                </p>
              </div>
              <button
                onClick={() => handleToggle("emailNotifications")}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  settings.emailNotifications
                    ? "bg-akatech-gold"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    settings.emailNotifications
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Maintenance Mode
                </p>
                <p className="text-xs text-gray-500">
                  Disable public access temporarily
                </p>
              </div>
              <button
                onClick={() => handleToggle("maintenanceMode")}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  settings.maintenanceMode
                    ? "bg-red-500"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    settings.maintenanceMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
