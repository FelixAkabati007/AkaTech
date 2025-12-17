import React, { useState, useEffect, useRef } from "react";

export const LazyPreview = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { rootMargin: "200px" }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="min-h-[160px]">
      {visible ? (
        children
      ) : (
        <div className="w-full h-40 bg-gray-50 dark:bg-akatech-card animate-pulse rounded-lg border border-gray-200 dark:border-white/10" />
      )}
    </div>
  );
};
