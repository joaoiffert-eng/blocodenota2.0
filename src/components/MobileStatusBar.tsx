import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

export const MobileStatusBar: React.FC = () => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-10 pt-1 px-6 flex items-center justify-between text-xs font-semibold select-none shrink-0 z-30 text-slate-800 dark:text-slate-100">
      {/* Clock */}
      <span className="w-14 text-center font-bold tracking-tight text-[13px]">
        {time || '09:41'}
      </span>

      {/* Dynamic Island / Notch Pill */}
      <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center gap-2 px-2 shadow-inner">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/60 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-blue-500/40" />
        </div>
        <div className="w-2 h-2 rounded-full bg-slate-800" />
      </div>

      {/* Status Icons */}
      <div className="w-14 flex items-center justify-end gap-1.5 text-slate-700 dark:text-slate-200">
        <Signal className="w-3.5 h-3.5" />
        <Wifi className="w-3.5 h-3.5" />
        <BatteryMedium className="w-4 h-4" />
      </div>
    </div>
  );
};
