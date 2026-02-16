import React, { useState, useEffect } from 'react';
import type { RoadmapStep } from '../types';

export type RoadmapsMap = Record<string, RoadmapStep[]>;

interface RoadmapsProps {
  roadmaps: RoadmapsMap;
  goals: string[];
  onSave: (roadmaps: RoadmapsMap) => Promise<void>;
}

const STATUS_CYCLE: RoadmapStep['status'][] = ['pending', 'in-progress', 'completed'];

function statusColor(status: RoadmapStep['status']): string {
  if (status === 'completed') return 'bg-green-500';
  if (status === 'in-progress') return 'bg-amber-400 dark:bg-amber-500';
  return 'bg-red-400 dark:bg-red-500';
}

function statusLabel(status: RoadmapStep['status']): string {
  if (status === 'completed') return 'Tamamlandı';
  if (status === 'in-progress') return 'Devam ediyor';
  return 'Bekliyor';
}

const Roadmaps: React.FC<RoadmapsProps> = ({ roadmaps, goals, onSave }) => {
  const copy = (r: RoadmapsMap) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.map((s) => ({ ...s, details: [...s.details] }))]));
  const [local, setLocal] = useState<RoadmapsMap>(() => copy(roadmaps));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    setLocal(copy(roadmaps));
  }, [roadmaps]);

  const updateCategory = (category: string, steps: RoadmapStep[]) => {
    setLocal((prev) => ({ ...prev, [category]: steps }));
  };

  const updateStep = (category: string, stepIdx: number, upd: Partial<RoadmapStep>) => {
    setLocal((prev) => {
      const steps = [...(prev[category] || [])];
      steps[stepIdx] = { ...steps[stepIdx], ...upd };
      return { ...prev, [category]: steps };
    });
  };

  const addStep = (category: string) => {
    setLocal((prev) => ({
      ...prev,
      [category]: [...(prev[category] || []), { title: 'Yeni adım', details: [], status: 'pending' }],
    }));
  };

  const removeStep = (category: string, stepIdx: number) => {
    setLocal((prev) => ({
      ...prev,
      [category]: (prev[category] || []).filter((_, i) => i !== stepIdx),
    }));
  };

  const addDetail = (category: string, stepIdx: number, detail: string) => {
    setLocal((prev) => {
      const steps = [...(prev[category] || [])];
      if (!steps[stepIdx]) return prev;
      steps[stepIdx] = { ...steps[stepIdx], details: [...steps[stepIdx].details, detail] };
      return { ...prev, [category]: steps };
    });
  };

  const removeDetail = (category: string, stepIdx: number, detailIdx: number) => {
    const steps = [...(local[category] || [])];
    if (!steps[stepIdx]) return;
    steps[stepIdx] = { ...steps[stepIdx], details: steps[stepIdx].details.filter((_, i) => i !== detailIdx) };
    setLocal((prev) => ({ ...prev, [category]: steps }));
  };

  const addRoadmap = (category: string) => {
    const name = category.trim();
    if (!name) return;
    if (local[name]) return; // zaten var
    setLocal((prev) => ({ ...prev, [name]: [{ title: 'İlk adım', details: [], status: 'pending' }] }));
    setNewCategory('');
  };

  const removeRoadmap = (category: string) => {
    setLocal((prev) => {
      const next = { ...prev };
      delete next[category];
      return next;
    });
  };

  const cycleStepStatus = (category: string, stepIdx: number) => {
    setLocal((prev) => {
      const steps = [...(prev[category] || [])];
      if (!steps[stepIdx]) return prev;
      const current = steps[stepIdx].status;
      const nextIdx = (STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length;
      steps[stepIdx] = { ...steps[stepIdx], status: STATUS_CYCLE[nextIdx] };
      return { ...prev, [category]: steps };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await onSave(local);
      setMessage('Yol haritaları kaydedildi.');
    } catch {
      setMessage('Kaydetme başarısız.');
    }
    setSaving(false);
  };

  const categories = Object.keys(local);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Yol Haritaları</h1>
        <div className="flex items-center gap-2">
          {message && (
            <span className={`text-sm ${message.includes('başarısız') ? 'text-red-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {message}
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600">
        <span className="text-sm text-slate-600 dark:text-slate-300">Yol haritası ekle:</span>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRoadmap(newCategory))}
          placeholder="Hedef adı yaz (örn. React, İngilizce, Staj)"
          className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm min-w-[200px] focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <button
          type="button"
          onClick={() => addRoadmap(newCategory)}
          className="px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-800"
        >
          + Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 rounded-lg text-sm">
                  {category[0]}
                </span>
                {category} Yol Haritası
              </h2>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => addStep(category)}
                  className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded"
                  title="Adım ekle"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
                <button
                  type="button"
                  onClick={() => removeRoadmap(category)}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded"
                  title="Yol haritasını kaldır"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {(local[category] || []).map((step, idx) => (
                <div key={idx} className="relative pl-6 pb-4 border-l-2 border-slate-200 dark:border-slate-600 last:pb-0">
                  <button
                    type="button"
                    onClick={() => cycleStepStatus(category, idx)}
                    title={`${statusLabel(step.status)} — tıkla: değiştir`}
                    className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 shadow-sm cursor-pointer hover:scale-110 transition-transform ${statusColor(step.status)}`}
                    aria-label={statusLabel(step.status)}
                  />
                  <div className="flex gap-2 items-start justify-between">
                    <input
                      value={step.title}
                      onChange={(e) => updateStep(category, idx, { title: e.target.value })}
                      className="flex-1 font-semibold text-sm bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-500 focus:border-indigo-500 outline-none text-slate-800 dark:text-white py-0.5"
                    />
                    <button type="button" onClick={() => removeStep(category, idx)} className="p-1 text-slate-400 hover:text-red-500" title="Adımı kaldır">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {step.details.map((detail, dIdx) => (
                      <li key={dIdx} className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 group">
                        <span className="w-1 h-1 bg-slate-300 dark:bg-slate-500 rounded-full flex-shrink-0" />
                        <span className="flex-1 min-w-0">{detail}</span>
                        <button type="button" onClick={() => removeDetail(category, idx, dIdx)} className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-red-500">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </li>
                    ))}
                    <li className="flex gap-2 mt-1">
                      <input
                        type="text"
                        placeholder="+ Alt madde ekle"
                        className="flex-1 text-xs px-2 py-1 border border-dashed border-slate-200 dark:border-slate-600 rounded bg-transparent text-slate-600 dark:text-slate-400 placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                        onKeyDown={(e) => {
                          const v = (e.target as HTMLInputElement).value.trim();
                          if (e.key === 'Enter' && v) {
                            addDetail(category, idx, v);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Roadmaps;
