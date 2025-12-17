import React, { useState } from "react";
import { motion } from "framer-motion";
import { Icons } from "@components/ui/Icons";
import { useToast } from "@components/ui/ToastProvider";

export const Careers = ({ onHome }) => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    addToast("Application received! We'll keep you in mind.", "success");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-akatech-dark pt-28 pb-12 transition-colors duration-500">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Navigation */}
        <div className="mb-8">
          <button
            onClick={onHome}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-akatech-gold transition-colors text-sm font-bold uppercase tracking-wider"
          >
            <span>←</span> Back to Home
          </button>
        </div>

        {/* Not Hiring Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-200 dark:bg-white/5 border-l-4 border-akatech-gold p-6 mb-12 rounded-r-lg"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            We are currently not hiring
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            While we don't have any open positions at the moment, we are always
            interested in connecting with talented individuals who share our
            passion for digital excellence.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-6">
              Join the AkaTech Culture
            </h1>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              At AkaTech IT Solutions, we believe in crafting more than just
              code; we build experiences. Our culture is rooted in innovation,
              precision, and a relentless pursuit of quality.
            </p>
            <ul className="space-y-4">
              {[
                "Innovation First",
                "Commitment to Excellence",
                "Work-Life Balance",
                "Continuous Learning",
              ].map((val, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium"
                >
                  <div className="w-2 h-2 bg-akatech-gold rounded-full"></div>
                  {val}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white dark:bg-akatech-card p-8 border border-gray-200 dark:border-white/5 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Future Opportunities
            </h3>
            {formSubmitted ? (
              <div className="text-center py-8">
                <Icons.Check className="text-green-500 w-12 h-12 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">
                  Thanks for your interest! We've received your information and
                  will keep you in mind for future openings.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3 text-sm text-gray-900 dark:text-white focus:border-akatech-gold outline-none"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3 text-sm text-gray-900 dark:text-white focus:border-akatech-gold outline-none"
                />
                <input
                  type="text"
                  placeholder="Area of Interest (e.g., Frontend, UI/UX)"
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3 text-sm text-gray-900 dark:text-white focus:border-akatech-gold outline-none"
                />
                <textarea
                  rows="3"
                  placeholder="Tell us a bit about yourself..."
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3 text-sm text-gray-900 dark:text-white focus:border-akatech-gold outline-none resize-none"
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-gold-gradient text-black font-bold py-3 text-xs uppercase tracking-widest hover:opacity-90 transition"
                >
                  Submit Interest
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
