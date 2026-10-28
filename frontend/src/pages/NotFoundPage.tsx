import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md bg-white p-8 rounded-3xl border border-[#685044]/20 shadow-lg space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#99b2dd]/30 text-[#3a405a] flex items-center justify-center mx-auto">
          <Activity className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-[#3a405a]">404</h1>
        <h2 className="text-lg font-bold text-[#685044]">Surveillance Page Not Found</h2>
        <p className="text-xs text-[#685044] leading-relaxed">
          The requested health surveillance module or record does not exist or has been relocated.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3a405a] text-white text-xs font-bold rounded-xl hover:bg-[#2e3348] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#99b2dd]" />
          Return to Portal Home
        </Link>
      </div>
    </div>
  );
};
