import React, { useState } from "react";
import { motion } from "framer-motion";
import { Icons } from "./Icons";
import { Logo } from "./Logo";
import { useToast } from "./ToastProvider";

export const AuthModal = ({ isOpen, onClose, onLogin, onSignup }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate logic
    if (isLoginView) {
      onLogin(email);
      addToast(`Welcome back, ${email.split("@")[0]}!`, "success");
    } else {
      onSignup(email);
      addToast("Account created successfully!", "success");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 dark:bg-black/90 backdrop-blur-md p-4 transition-colors duration-500">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-akatech-card border border-gray-200 dark:border-akatech-gold/30 w-full max-w-md p-10 relative shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto no-scrollbar transition-colors duration-500"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white transition z-10"
        >
          <Icons.X />
        </button>

        <div className="text-center mb-10">
          <Logo className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-serif text-gray-900 dark:text-white mb-2 transition-colors duration-500">
            {isLoginView ? "Welcome Back" : "Join AkaTech"}
          </h2>
          <p className="text-akatech-gold text-xs uppercase tracking-widest">
            Access your premium dashboard
          </p>
        </div>

        <button
          onClick={() => {
            onLogin("google-user");
            addToast("Signed in with Google", "success");
          }}
          className="w-full bg-gray-50 dark:bg-white text-black py-3 mb-6 flex items-center justify-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-200 transition border border-gray-200 dark:border-transparent"
        >
          <Icons.Google className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Continue with Google
          </span>
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-[1px] bg-gray-200 dark:bg-white/10 flex-1"></div>
          <span className="text-gray-400 dark:text-gray-600 text-[10px] uppercase">
            Or
          </span>
          <div className="h-[1px] bg-gray-200 dark:bg-white/10 flex-1"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] text-akatech-gold uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 dark:bg-akatech-dark border border-gray-300 dark:border-white/10 p-3 text-gray-900 dark:text-white focus:border-akatech-gold outline-none transition-colors"
              placeholder="name@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] text-akatech-gold uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 dark:bg-akatech-dark border border-gray-300 dark:border-white/10 p-3 text-gray-900 dark:text-white focus:border-akatech-gold outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gold-gradient text-black py-3 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition shadow-lg mt-4"
          >
            {isLoginView ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 dark:border-white/5 pt-4 transition-colors duration-500">
          <button
            onClick={() => setIsLoginView(!isLoginView)}
            className="text-gray-500 text-xs hover:text-akatech-gold transition"
          >
            {isLoginView
              ? "New to AkaTech? Request Access"
              : "Already a member? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
