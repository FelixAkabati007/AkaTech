import React from "react";
import { SignupWizard } from "../components/client/SignupWizard";
import { useToast } from "@components/ui/ToastProvider";

export const PlanCompletion = ({ plan, onBack, onNavigate, onUserUpdate }) => {
  const { addToast } = useToast();

  const handleComplete = (user) => {
    addToast("Signup successful! Welcome aboard.", "success");
    if (onUserUpdate) onUserUpdate(user);
    if (onNavigate) onNavigate("dashboard");
  };

  return (
    <SignupWizard
      initialPlan={plan}
      onBack={onBack}
      onComplete={handleComplete}
    />
  );
};
