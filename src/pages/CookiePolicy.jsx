import React from "react";
import { motion } from "framer-motion";

export const CookiePolicy = ({ onHome }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-akatech-dark pt-28 pb-12 transition-colors duration-500">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <button
            onClick={onHome}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-akatech-gold transition-colors text-sm font-bold uppercase tracking-wider"
          >
            <span>←</span> Back to Home
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose dark:prose-invert max-w-none"
        >
          <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-2">
            Cookie Policy
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Effective Date: December 15, 2023
          </p>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              1. What Are Cookies
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Cookies are small pieces of text sent to your web browser by
              a website you visit. A cookie file is stored in your web
              browser and allows the Service or a third-party to recognize
              you and make your next visit easier and the Service more
              useful to you.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              2. How AkaTech Uses Cookies
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              When you use and access the Service, we may place a number
              of cookies files in your web browser. We use cookies for the
              following purposes:
            </p>
            <div className="space-y-4">
              <div className="bg-white dark:bg-akatech-card p-4 rounded border border-gray-200 dark:border-white/5">
                <h4 className="font-bold text-akatech-gold mb-1">
                  Essential Cookies
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We use essential cookies to authenticate users and
                  prevent fraudulent use of user accounts.
                </p>
              </div>
              <div className="bg-white dark:bg-akatech-card p-4 rounded border border-gray-200 dark:border-white/5">
                <h4 className="font-bold text-akatech-gold mb-1">
                  Analytics Cookies
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We use analytics cookies to track information how the
                  Service is used so that we can make improvements.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              3. Your Choices Regarding Cookies
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              If you'd like to delete cookies or instruct your web browser
              to delete or refuse cookies, please visit the help pages of
              your web browser. Please note, however, that if you delete
              cookies or refuse to accept them, you might not be able to
              use all of the features we offer, you may not be able to
              store your preferences, and some of our pages might not
              display properly.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};
