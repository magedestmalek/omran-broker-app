import React, { useState, useEffect } from 'react';
import { Wifi, Battery } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  enabled: boolean;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children, enabled }) => {
  const [time, setTime] = useState('09:41');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!enabled) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-2 sm:p-6 transition-colors">
      {/* Smartphone Chassis Mockup */}
      <div className="relative w-full max-w-[420px] h-[890px] max-h-[96vh] bg-black rounded-[48px] p-3 shadow-2xl shadow-emerald-950/40 ring-1 ring-slate-800 flex flex-col overflow-hidden">
        {/* Device Outer Frame Accents */}
        <div className="absolute top-28 -left-[5px] w-1 h-12 bg-slate-800 rounded-l-md" />
        <div className="absolute top-44 -left-[5px] w-1 h-12 bg-slate-800 rounded-l-md" />
        <div className="absolute top-36 -right-[5px] w-1 h-16 bg-slate-800 rounded-r-md" />

        {/* Screen Bezel Area */}
        <div className="relative w-full h-full bg-slate-50 dark:bg-slate-950 rounded-[38px] overflow-hidden flex flex-col border border-slate-800/20">
          {/* Simulated Mobile Status Bar */}
          <div className="h-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 select-none shrink-0 z-50">
            <span className="tracking-tight text-[11px] font-mono">{time}</span>
            {/* Dynamic Island / Speaker Pill */}
            <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800/80 mr-6" />
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          {/* Scrollable Content inside Mobile Viewport */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
            {children}
          </div>

          {/* iOS Home Indicator Bar */}
          <div className="h-4 bg-white/95 dark:bg-slate-900/95 flex items-center justify-center shrink-0 z-50 select-none pb-1">
            <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
