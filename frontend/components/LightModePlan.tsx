import React from 'react';
import type { MotivationMode } from '../lib/supabase';

interface LightModePlanProps {
  motivationMode?: MotivationMode;
}

const LightModePlan: React.FC<LightModePlanProps> = ({ motivationMode = 'normal' }) => {
  const isActive = motivationMode === 'low';

  return (
    <div className={`border p-6 rounded-2xl transition-colors ${isActive ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 shadow-sm' : 'bg-orange-50/50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'}`}>
      <h3 className="text-orange-800 dark:text-orange-200 font-bold mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
        Düşük Motivasyon Günü (Hafif Mod)
        {isActive && (
          <span className="ml-auto text-xs font-semibold bg-orange-200 dark:bg-orange-700 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded-full">Aktif</span>
        )}
      </h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-200 dark:bg-orange-700 text-orange-700 dark:text-orange-200 flex items-center justify-center font-bold text-xs">1</div>
          <p className="text-sm text-orange-800 dark:text-orange-200">Tüm teknik odak bloklarını 15 dakikaya indir.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-200 dark:bg-orange-700 text-orange-700 dark:text-orange-200 flex items-center justify-center font-bold text-xs">2</div>
          <p className="text-sm text-orange-800 dark:text-orange-200">Kod yazma, sadece teknik podcast veya video izle.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-200 dark:bg-orange-700 text-orange-700 dark:text-orange-200 flex items-center justify-center font-bold text-xs">3</div>
          <p className="text-sm text-orange-800 dark:text-orange-200">ALES için sadece 5 paragraf sorusu çöz.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-200 dark:bg-orange-700 text-orange-700 dark:text-orange-200 flex items-center justify-center font-bold text-xs">4</div>
          <p className="text-sm text-orange-800 dark:text-orange-200">Günü erkenden kapat ve vicdan azabı çekme.</p>
        </div>
      </div>
      {!isActive && (
        <p className="text-xs text-orange-600 dark:text-orange-400 mt-3">Düşük motivasyon hissettiğinde yukarıdan &quot;Düşük motivasyon&quot;u seç; bu öneriler o gün için rehberin olsun.</p>
      )}
    </div>
  );
};

export default LightModePlan;
