import React, { useState, useEffect } from 'react';
import type { SprintWeek } from '../types';

interface SprintPlannerProps {
  sprints: SprintWeek[];
  onSave: (sprints: SprintWeek[]) => Promise<void>;
}

const SprintPlanner: React.FC<SprintPlannerProps> = ({ sprints, onSave }) => {
  const [local, setLocal] = useState<SprintWeek[]>(() => sprints.map((s) => ({ ...s, tasks: [...s.tasks] })));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLocal(sprints.map((s) => ({ ...s, tasks: [...s.tasks] })));
  }, [sprints]);

  const updateWeek = (weekIdx: number, upd: Partial<SprintWeek>) => {
    setLocal((prev) => prev.map((w, i) => (i === weekIdx ? { ...w, ...upd } : w)));
  };

  const updateTask = (weekIdx: number, taskIdx: number, value: string) => {
    setLocal((prev) => {
      const next = prev.map((w, i) => {
        if (i !== weekIdx) return w;
        const tasks = [...w.tasks];
        tasks[taskIdx] = value;
        return { ...w, tasks };
      });
      return next;
    });
  };

  const addTask = (weekIdx: number) => {
    setLocal((prev) => prev.map((w, i) => (i === weekIdx ? { ...w, tasks: [...w.tasks, ''] } : w)));
  };

  const removeTask = (weekIdx: number, taskIdx: number) => {
    setLocal((prev) => prev.map((w, i) => (i === weekIdx ? { ...w, tasks: w.tasks.filter((_, t) => t !== taskIdx) } : w)));
  };

  const addWeek = () => {
    const nextWeek = Math.max(1, ...local.map((s) => s.week)) + 1;
    setLocal((prev) => [...prev, { week: nextWeek, focus: '', tasks: [''] }]);
  };

  const removeWeek = (weekIdx: number) => {
    setLocal((prev) => prev.filter((_, i) => i !== weekIdx).map((w, i) => ({ ...w, week: i + 1 })));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await onSave(local);
      setMessage('Sprint planı kaydedildi.');
    } catch {
      setMessage('Kaydetme başarısız.');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Sprint Planı</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Haftalık odak ve görevleri düzenleyebilirsin.</p>
        </div>
        <div className="flex items-center gap-2">
          {message && (
            <span className={`text-sm ${message.includes('başarısız') ? 'text-red-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {message}
            </span>
          )}
          <button
            type="button"
            onClick={addWeek}
            className="px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl"
          >
            + Hafta ekle
          </button>
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

      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="space-y-8">
          {local.map((sprint, weekIdx) => (
            <div key={sprint.week} className="flex gap-6 group">
              <div className="flex-none w-20 flex items-start justify-between">
                <span className="text-4xl font-black text-slate-100 dark:text-slate-600 group-hover:text-indigo-100 dark:group-hover:text-indigo-900/50 transition-colors">
                  W{sprint.week}
                </span>
                <button
                  type="button"
                  onClick={() => removeWeek(weekIdx)}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded"
                  title="Haftayı kaldır"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={sprint.focus}
                  onChange={(e) => updateWeek(weekIdx, { focus: e.target.value })}
                  placeholder="Hafta odağı (örn. React Context & Java OOP)"
                  className="w-full text-lg font-bold text-slate-700 dark:text-slate-200 bg-transparent border-b border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-indigo-500 outline-none py-1"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sprint.tasks.map((task, taskIdx) => (
                    <div key={taskIdx} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-transparent hover:border-indigo-100 dark:hover:border-slate-600">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
                        readOnly
                      />
                      <input
                        type="text"
                        value={task}
                        onChange={(e) => updateTask(weekIdx, taskIdx, e.target.value)}
                        placeholder="Görev"
                        className="flex-1 min-w-0 text-sm text-slate-600 dark:text-slate-200 bg-transparent border-none focus:outline-none focus:ring-0"
                      />
                      <button
                        type="button"
                        onClick={() => removeTask(weekIdx, taskIdx)}
                        className="p-1 text-slate-400 hover:text-red-500 flex-shrink-0"
                        title="Kaldır"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addTask(weekIdx)}
                  className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg px-3 py-1.5"
                >
                  + Görev ekle
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SprintPlanner;
