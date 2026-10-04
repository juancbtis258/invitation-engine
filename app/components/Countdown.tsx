"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: string;
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    días: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          días: Math.floor(difference / (1000 * 60 * 60 * 24)),
          horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutos: Math.floor((difference / 1000 / 60) % 60),
          segundos: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ días: 0, horas: 0, minutos: 0, segundos: 0 });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-4 gap-2 md:gap-4 my-6 w-full max-w-md mx-auto">
        {["días", "horas", "minutos", "segundos"].map((label) => (
          <div
            key={label}
            className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-xl p-3 text-center shadow-lg animate-pulse"
          >
            <span className="text-xl md:text-3xl font-extrabold text-amber-400 block">
              0
            </span>
            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-slate-300">
              {label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-4 my-6 w-full max-w-md mx-auto">
      {Object.entries(timeLeft).map(([label, value]) => (
        <div
          key={label}
          className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-xl p-3 text-center shadow-lg"
        >
          <span className="text-xl md:text-3xl font-extrabold text-amber-400 block">
            {value}
          </span>
          <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-slate-300">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}