import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icons } from "../ui/Icons";
import { WEBSITE_SAMPLES } from "@lib/data";

/**
 * Hero section component showcasing the brand's value proposition and sample works.
 * Features an auto-rotating showcase of website samples and animated floating elements.
 *
 * @component
 */
export const Hero = () => {
  const [currentSample, setCurrentSample] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSample((prev) => (prev + 1) % WEBSITE_SAMPLES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden bg-hero-glow-light dark:bg-hero-glow transition-colors duration-300">
      <div
        className="absolute inset-0 z-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(#C5A059 1px, transparent 1px), linear-gradient(90deg, #C5A059 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      ></div>

      <div className="container mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-left"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-[1px] w-16 bg-gradient-to-r from-akatech-gold to-transparent"></div>
            <span className="text-akatech-gold text-xs font-bold tracking-[0.3em] uppercase">
              Est. 2023 | Ghana
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-7xl font-serif font-bold leading-[1.1] mb-6 text-gray-900 dark:text-white transition-colors duration-300">
            Digital <br />
            <span className="gold-text-clip">Excellence</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-10 max-w-lg font-light leading-relaxed border-l-2 border-akatech-gold/30 pl-6 transition-colors duration-300">
            AkaTech IT Solutions engineers premium software architectures,
            blending elegance with high-performance computing for visionary
            businesses.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#pricing" className="btn-primary">
              View Packages
            </a>
            <a href="#contact" className="btn-outline">
              Our Work
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative flex justify-center h-[500px] md:h-[650px] items-center scale-[0.85] sm:scale-100 transition-transform duration-300"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="hidden sm:flex absolute top-10 -left-2 z-10 glass-panel p-3 rounded-2xl shadow-xl items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
              <Icons.Code size={20} />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-gray-900 dark:text-white">
                Clean Code
              </div>
              <div className="text-[10px] text-gray-500">React & Next.js</div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="hidden sm:flex absolute top-1/2 -right-2 md:-right-6 z-10 glass-panel p-3 rounded-2xl shadow-xl items-center gap-3 border border-white/20"
          >
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
              <Icons.BarChart size={20} />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-gray-900 dark:text-white">
                Analytics
              </div>
              <div className="text-[10px] text-gray-500">Real-time Data</div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="hidden sm:flex absolute bottom-20 -left-4 z-10 glass-panel p-3 rounded-2xl shadow-xl items-center gap-3 border border-white/20"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
              <Icons.Palette size={20} />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-gray-900 dark:text-white">
                UI Design
              </div>
              <div className="text-[10px] text-gray-500">Pixel Perfect</div>
            </div>
          </motion.div>

          <div className="relative w-[280px] h-[580px] md:w-[320px] md:h-[650px] bg-black rounded-[55px] device-frame z-20 shadow-2xl overflow-hidden transition-all duration-500">
            <div className="absolute top-24 -left-[2px] w-[3px] h-8 bg-gray-700 rounded-l-md"></div>
            <div className="absolute top-36 -left-[2px] w-[3px] h-16 bg-gray-700 rounded-l-md"></div>
            <div className="absolute top-28 -right-[2px] w-[3px] h-20 bg-gray-700 rounded-r-md"></div>

            <div className="absolute top-0 left-0 right-0 h-full w-full rounded-[48px] border-[8px] border-black overflow-hidden bg-black">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-9 bg-black rounded-full z-50 flex items-center justify-center gap-4 pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-[#1a1a1a]/80"></div>
              </div>

              <div className="w-full h-full relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSample}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full bg-white dark:bg-akatech-dark"
                  >
                    {WEBSITE_SAMPLES[currentSample].content}
                  </motion.div>
                </AnimatePresence>

                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/10 to-transparent z-40 rounded-[40px] opacity-50"></div>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-50">
                  {WEBSITE_SAMPLES.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentSample(idx)}
                      className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all shadow-sm ${
                        idx === currentSample ? "bg-white w-4" : "bg-white/50"
                      }`}
                    ></div>
                  ))}
                </div>

                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/50 rounded-full z-50"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-akatech-gold/50">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </div>
    </section>
  );
};
