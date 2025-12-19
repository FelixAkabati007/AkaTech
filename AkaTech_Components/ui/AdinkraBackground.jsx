import React, { useEffect, useState } from 'react';

// Adinkra Symbol Paths (0-100 viewBox)
const SYMBOLS = [
  // Adinkrahene (King of Adinkra Symbols - Leadership, Greatness)
  // Three concentric circles
  {
    name: 'Adinkrahene',
    path: 'M 50 50 m -35 0 a 35 35 0 1 0 70 0 a 35 35 0 1 0 -70 0 M 50 50 m -23 0 a 23 23 0 1 0 46 0 a 23 23 0 1 0 -46 0 M 50 50 m -12 0 a 12 12 0 1 0 24 0 a 12 12 0 1 0 -24 0',
    viewBox: '0 0 100 100'
  },
  // Duafe (Wooden Comb - Beauty, Hygiene, Feminine Qualities)
  {
    name: 'Duafe',
    path: 'M20 15 H80 V40 H20 Z M28 40 V85 H32 V40 M42 40 V85 H46 V40 M56 40 V85 H60 V40 M70 40 V85 H74 V40',
    viewBox: '0 0 100 100'
  },
  // Nkyinkyim (Twisting - Initiative, Dynamism, Versatility)
  {
    name: 'Nkyinkyim',
    path: 'M15 50 Q 30 20 45 50 T 75 50 T 105 50', // Extended path
    viewBox: '0 0 120 100' // Adjusted viewBox
  },
  // Sankofa (Return and Get It - Learning from the Past)
  // Heart shape stylization
  {
    name: 'Sankofa',
    path: 'M 50 85 C 10 45 10 15 50 35 C 90 15 90 45 50 85 M 50 35 C 55 25 65 25 70 30 C 75 35 70 45 60 45', 
    viewBox: '0 0 100 100'
  },
  // Mpatapo (Knot of Pacification/Reconciliation)
  // Square knot representation
  {
    name: 'Mpatapo',
    path: 'M30 30 Q 30 10 50 10 Q 70 10 70 30 Q 70 50 50 50 Q 30 50 30 70 Q 30 90 50 90 Q 70 90 70 70 M 30 30 L 70 70', // Simplified knot
    viewBox: '0 0 100 100'
  }
];

const AdinkraBackground = () => {
  const [symbols, setSymbols] = useState([]);

  useEffect(() => {
    const generateSymbols = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Density: 1 symbol per ~50000px² (adjust for density)
      // e.g. 1920x1080 = 2,073,600 / 50000 = ~41 symbols
      const area = width * height;
      const targetCount = Math.floor(area / 50000); 
      
      const newSymbols = [];
      const minDistance = 80; // 50px spacing + roughly half symbol size (30-80px)
      let attempts = 0;
      const maxAttempts = targetCount * 50;

      while (newSymbols.length < targetCount && attempts < maxAttempts) {
        attempts++;
        
        const size = Math.floor(Math.random() * (80 - 30 + 1)) + 30; // 30px to 80px
        const x = Math.random() * width;
        const y = Math.random() * height;
        
        // Check collision
        let collision = false;
        for (const s of newSymbols) {
          const dx = x - s.x;
          const dy = y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDistance + (s.size + size) / 2) {
            collision = true;
            break;
          }
        }

        if (!collision) {
          const typeIndex = Math.floor(Math.random() * SYMBOLS.length);
          newSymbols.push({
            id: attempts, // unique-ish id
            ...SYMBOLS[typeIndex],
            size,
            x,
            y,
            rotation: Math.random() * 360,
          });
        }
      }
      
      setSymbols(newSymbols);
    };

    generateSymbols();
    
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(generateSymbols, 300); // Debounce
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
      {symbols.map((s) => (
        <svg
          key={s.id}
          viewBox={s.viewBox}
          width={s.size}
          height={s.size}
          style={{
            position: 'absolute',
            left: s.x,
            top: s.y,
            transform: `rotate(${s.rotation}deg)`,
            opacity: 0.5,
            filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))',
            color: 'white', // fallback
          }}
          className="text-white fill-current transition-all duration-500 ease-in-out"
        >
          <path d={s.path} stroke="none" />
        </svg>
      ))}
    </div>
  );
};

export default AdinkraBackground;
