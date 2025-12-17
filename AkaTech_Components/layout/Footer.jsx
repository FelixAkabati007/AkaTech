import React from "react";
import { Logo } from "../ui/Logo";

export const Footer = ({ onNavigate }) => (
  <footer className="bg-gray-100 dark:bg-[#050505] py-16 border-t border-gray-200 dark:border-white/5 text-center md:text-left transition-colors duration-500">
    <div className="container mx-auto px-4 grid md:grid-cols-4 gap-12">
      <div>
        <div className="flex items-center gap-2 mb-6 justify-center md:justify-start">
          <Logo className="w-8 h-8" />
          <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white transition-colors duration-500">
            AKATECH
          </h3>
        </div>
        <p className="text-gray-600 text-xs leading-relaxed">
          Crafting premium digital experiences
          <br />
          from Ghana to the world.
        </p>
        <p className="text-gray-500 dark:text-gray-700 text-[10px] mt-4 uppercase tracking-widest transition-colors duration-500">
          © 2023 Mr. Felix Akabati. All Rights Reserved.
        </p>
      </div>
      <div>
        <h4 className="text-gray-900 dark:text-white font-bold mb-6 text-xs uppercase tracking-widest transition-colors duration-500">
          Services
        </h4>
        <ul className="space-y-3 text-xs text-gray-500">
          <li className="hover:text-akatech-gold cursor-pointer transition">
            Web Development
          </li>
          <li className="hover:text-akatech-gold cursor-pointer transition">
            System Architecture
          </li>
          <li className="hover:text-akatech-gold cursor-pointer transition">
            POS Systems
          </li>
          <li className="hover:text-akatech-gold cursor-pointer transition">
            Graphic Design
          </li>
        </ul>
      </div>
      <div>
        <h4 className="text-gray-900 dark:text-white font-bold mb-6 text-xs uppercase tracking-widest transition-colors duration-500">
          Company
        </h4>
        <ul className="space-y-3 text-xs text-gray-500">
          <li className="hover:text-akatech-gold cursor-pointer transition">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("landing");
              }}
            >
              About Us
            </a>
          </li>
          <li className="hover:text-akatech-gold cursor-pointer transition">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("portfolio");
              }}
            >
              Portfolio
            </a>
          </li>
          <li className="hover:text-akatech-gold cursor-pointer transition">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("careers");
              }}
            >
              Careers
            </a>
          </li>
          <li className="hover:text-akatech-gold cursor-pointer transition">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("contact");
              }}
            >
              Contact
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="text-gray-900 dark:text-white font-bold mb-6 text-xs uppercase tracking-widest transition-colors duration-500">
          Legal
        </h4>
        <ul className="space-y-3 text-xs text-gray-500">
          <li className="hover:text-akatech-gold cursor-pointer transition">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("privacy");
              }}
            >
              Privacy Policy
            </a>
          </li>
          <li className="hover:text-akatech-gold cursor-pointer transition">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("terms");
              }}
              className="text-gray-500 hover:text-akatech-gold hover:underline decoration-akatech-gold underline-offset-4 transition-all duration-300"
            >
              Terms of Service
            </a>
          </li>
          <li className="hover:text-akatech-gold cursor-pointer transition">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("cookie");
              }}
            >
              Cookie Policy
            </a>
          </li>
        </ul>
      </div>
    </div>
  </footer>
);
