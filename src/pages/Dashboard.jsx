import React from "react";
import { AdminLayout } from "../components/admin/AdminLayout";
import { ClientLayout } from "../components/client/ClientLayout";

export const Dashboard = ({ user, onLogout, onUserUpdate }) => {
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";

  if (isAdmin) {
    return <AdminLayout user={user} onLogout={onLogout} />;
  }

  return (
    <ClientLayout user={user} onLogout={onLogout} onUserUpdate={onUserUpdate} />
  );
};
