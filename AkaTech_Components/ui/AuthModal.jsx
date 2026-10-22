import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@components/ui/Icons";
import { Logo } from "@components/ui/Logo";
import { useToast } from "@components/ui/ToastProvider";

const passwordHint =
  "Use at least 8 characters with uppercase, lowercase, and a number.";

const GoogleAuthButton = ({ mode, onGoogleLogin, onGoogleUnavailable }) => {
  const { addToast } = useToast();

  const startGoogleAuth = () => {
    try {
      onGoogleLogin?.({ mode });
    } catch (error) {
      addToast("Google Sign-In failed. Use email instead.", "error");
      onGoogleUnavailable?.();
    }
  };

  return (
    <button
      type="button"
      onClick={startGoogleAuth}
      className="w-full bg-gray-50 dark:bg-white text-black py-3 mb-6 flex items-center justify-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-200 transition border border-gray-200 dark:border-transparent"
    >
      <Icons.Google className="w-5 h-5" />
      <span className="text-xs font-bold uppercase tracking-wider">
        {mode === "signup" ? "Sign up with Google" : "Sign in with Google"}
      </span>
    </button>
  );
};

export const AuthModal = ({
  isOpen,
  onClose,
  onLogin,
  onSignup,
  onGoogleLogin,
  onGoogleUnavailable,
  onRequestPasswordReset,
  onResetPassword,
  resetToken,
  initialMode = "login",
  isGoogleAuthAvailable = true,
}) => {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setMode(resetToken ? "reset" : initialMode);
    }
  }, [initialMode, isOpen, resetToken]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleTabKey = (e) => {
      if (e.key !== "Tab" || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener("keydown", handleTabKey);
    return () => document.removeEventListener("keydown", handleTabKey);
  }, [isOpen]);

  const clearPasswords = () => {
    setPassword("");
    setConfirmPassword("");
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    clearPasswords();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await onLogin(email, password);
        addToast("Welcome back!", "success");
      } else if (mode === "signup") {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        await onSignup({ name, email, password });
        addToast("Account created successfully.", "success");
      } else if (mode === "forgot") {
        await onRequestPasswordReset(email);
        addToast("If that account exists, a reset link has been sent.", "success");
        switchMode("login");
      } else if (mode === "reset") {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        await onResetPassword({ token: resetToken, password });
        addToast("Password reset successfully. Please sign in.", "success");
        switchMode("login");
      }
    } catch (error) {
      addToast(error.message || "Authentication failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    const isInteractive = e.target.closest(
      "button, input, textarea, select, a, [tabindex], label"
    );

    if (!isInteractive) {
      onClose();
    }
  };

  const title =
    mode === "signup"
      ? "Create Account"
      : mode === "forgot"
      ? "Reset Password"
      : mode === "reset"
      ? "Choose New Password"
      : "Welcome Back";

  const submitLabel =
    mode === "signup"
      ? "Create Account"
      : mode === "forgot"
      ? "Send Reset Link"
      : mode === "reset"
      ? "Update Password"
      : "Sign In";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 dark:bg-black/90 backdrop-blur-md p-4"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md p-8 relative max-h-[90vh] overflow-y-auto no-scrollbar bg-gradient-to-br from-white via-[#fffbf2] to-[#f5ebd6] dark:from-akatech-card dark:via-[#1c1c1c] dark:to-[#2c2414] border border-akatech-gold/30 dark:border-akatech-gold/50 shadow-[0_20px_50px_-12px_rgba(197,160,89,0.3)]"
            ref={modalRef}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white transition z-10"
              aria-label="Close modal"
            >
              <Icons.X />
            </button>

            <div className="text-center mb-8">
              <Logo className="w-20 h-20 mx-auto mb-4" />
              <h2
                id="modal-title"
                className="text-2xl md:text-3xl font-serif text-gray-900 dark:text-white mb-2"
              >
                {title}
              </h2>
              <p className="text-akatech-gold text-xs uppercase tracking-widest">
                Secure client access
              </p>
            </div>

            {(mode === "login" || mode === "signup") &&
              (isGoogleAuthAvailable ? (
                <GoogleAuthButton
                  mode={mode}
                  onGoogleLogin={onGoogleLogin}
                  onGoogleUnavailable={onGoogleUnavailable}
                />
              ) : (
                <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                  Google authentication is unavailable. Continue with secure
                  email and password access.
                </div>
              ))}

            {(mode === "login" || mode === "signup") && (
              <div className="flex items-center gap-4 mb-6">
                <div className="h-[1px] bg-gray-200 dark:bg-white/10 flex-1"></div>
                <span className="text-gray-400 dark:text-gray-600 text-[10px] uppercase">
                  Or
                </span>
                <div className="h-[1px] bg-gray-200 dark:bg-white/10 flex-1"></div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-[10px] text-akatech-gold uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-akatech-dark border border-gray-300 dark:border-white/10 p-3 text-gray-900 dark:text-white focus:border-akatech-gold outline-none"
                    placeholder="Your name"
                    required
                  />
                </div>
              )}

              {(mode === "login" || mode === "signup" || mode === "forgot") && (
                <div>
                  <label className="block text-[10px] text-akatech-gold uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-akatech-dark border border-gray-300 dark:border-white/10 p-3 text-gray-900 dark:text-white focus:border-akatech-gold outline-none"
                    placeholder="name@company.com"
                    required
                    autoFocus
                  />
                </div>
              )}

              {(mode === "login" || mode === "signup" || mode === "reset") && (
                <div>
                  <label className="block text-[10px] text-akatech-gold uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-akatech-dark border border-gray-300 dark:border-white/10 p-3 text-gray-900 dark:text-white focus:border-akatech-gold outline-none"
                    placeholder="Password"
                    required
                  />
                  {(mode === "signup" || mode === "reset") && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {passwordHint}
                    </p>
                  )}
                </div>
              )}

              {(mode === "signup" || mode === "reset") && (
                <div>
                  <label className="block text-[10px] text-akatech-gold uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-akatech-dark border border-gray-300 dark:border-white/10 p-3 text-gray-900 dark:text-white focus:border-akatech-gold outline-none"
                    placeholder="Confirm password"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold-gradient text-black py-3 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition shadow-lg mt-4 disabled:opacity-60"
              >
                {isSubmitting ? "Please wait..." : submitLabel}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-gray-100 dark:border-white/5 pt-4 space-y-3">
              {mode === "login" && (
                <>
                  <button
                    onClick={() => switchMode("forgot")}
                    className="block mx-auto text-gray-500 text-xs hover:text-akatech-gold transition"
                  >
                    Forgot your password?
                  </button>
                  <button
                    onClick={() => switchMode("signup")}
                    className="block mx-auto text-gray-500 text-xs hover:text-akatech-gold transition"
                  >
                    New to AkaTech? Create an account
                  </button>
                </>
              )}
              {mode !== "login" && (
                <button
                  onClick={() => switchMode("login")}
                  className="text-gray-500 text-xs hover:text-akatech-gold transition"
                >
                  Back to sign in
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
