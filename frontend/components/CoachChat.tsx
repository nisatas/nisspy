
import React, { useState } from 'react';
import { getCoachAdvice } from '../services/geminiService';
import type { MotivationMode } from '../lib/supabase';

interface CoachChatProps {
  motivationMode?: MotivationMode;
}

const CoachChat: React.FC<CoachChatProps> = ({ motivationMode = 'normal' }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query) return;
    setLoading(true);
    const advice = await getCoachAdvice(query);
    setResponse(advice || '');
    setLoading(false);
  };

  const subtitle = motivationMode === 'low'
    ? 'Düşük motivasyon gününde kısa adımlar ve hafif öneriler için buradayım.'
    : 'Düşük motivasyon günlerinde veya teknik çıkmazlarda yanındayım.';

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl text-white shadow-xl shadow-indigo-200 dark:shadow-indigo-900/30">
      <h2 className="text-2xl font-bold mb-2">Yapay Zeka Koçuna Danış</h2>
      <p className="text-indigo-100 text-sm mb-6 opacity-90">{subtitle}</p>
      
      <div className="space-y-4">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Bugün hiç odaklanamıyorum, ne yapmalıyım? / Redux'ı ne kadar sürede öğrenirim?"
          className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 min-h-[100px]"
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-50"
        >
          {loading ? 'Düşünülüyor...' : 'Öneri Al'}
        </button>

        {response && (
          <div className="p-4 bg-white/10 rounded-xl border border-white/10 mt-4 text-sm leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="font-bold text-indigo-200 block mb-2 uppercase tracking-widest text-[10px]">Koç Önerisi:</span>
            {response}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachChat;
