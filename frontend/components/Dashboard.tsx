import React, { useState } from 'react';
import { Priority, DaySchedule, TaskBlock } from '../types';
import { exportScheduleToPdf, exportScheduleToExcel } from '../lib/exportSchedule';

type DayStatus = DaySchedule['status'];

interface DashboardProps {
  schedule: DaySchedule[];
  /** Kullanıcının hedefleri (Profil’den); görev kategorisi bu listeden seçilir */
  goals: string[];
  onAddTask: (dayName: string, task: Omit<TaskBlock, 'id'>) => void;
  onRemoveTask: (dayName: string, taskId: string) => void;
  onUpdateDayStatus: (dayName: string, status: DayStatus) => void;
  onUpdateTask: (dayName: string, taskId: string, updates: Partial<Pick<TaskBlock, 'title' | 'duration' | 'category' | 'time'>>) => void;
}

const STATUS_OPTIONS: { value: DayStatus; label: string }[] = [
  { value: 'Trainee', label: 'Trainee' },
  { value: 'School', label: 'School' },
  { value: 'Focus', label: 'Focus' },
  { value: 'Rest', label: 'Rest' },
];

const Dashboard: React.FC<DashboardProps> = ({
  schedule,
  goals,
  onAddTask,
  onRemoveTask,
  onUpdateDayStatus,
  onUpdateTask,
}) => {
  const defaultCategory = goals[0] ?? 'React';
  const [addingToDay, setAddingToDay] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<{ dayName: string; taskId: string } | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');
  const [newTask, setNewTask] = useState<Omit<TaskBlock, 'id'>>({
    title: '',
    duration: 60,
    priority: Priority.MEDIUM,
    category: defaultCategory,
    time: undefined,
  });

  const handleAddSubmit = (dayName: string) => {
    if (!newTask.title) return;
    onAddTask(dayName, newTask);
    setAddingToDay(null);
    setNewTask({ title: '', duration: 60, priority: Priority.MEDIUM, category: defaultCategory, time: undefined });
  };

  const startEditTask = (dayName: string, block: TaskBlock) => {
    setEditingTask({ dayName, taskId: block.id });
    setEditTitle(block.title);
    setEditTime(block.time ?? '');
  };

  const saveEditTask = () => {
    if (!editingTask || !editTitle.trim()) {
      setEditingTask(null);
      return;
    }
    onUpdateTask(editingTask.dayName, editingTask.taskId, {
      title: editTitle.trim(),
      time: editTime.trim() || undefined,
    });
    setEditingTask(null);
  };

  const uniqueStatuses = Array.from(new Set(schedule.map(d => d.status)));

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Haftalık Stratejik Plan</h1>
          <p className="text-slate-500 dark:text-slate-400">Gün tipini ve görevleri düzenleyerek takviminizi özelleştirin.</p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => exportScheduleToPdf(schedule)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
              PDF İndir
            </button>
            <button
              type="button"
              onClick={() => exportScheduleToExcel(schedule)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-sm font-medium hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
              Excel İndir
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {uniqueStatuses.map(status => (
            <span
              key={status}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                status === 'Focus' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' :
                status === 'Rest' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' :
                status === 'School' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' :
                'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {status} Günü
            </span>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-5 min-w-0">
        {schedule.map((day) => (
          <div key={day.dayName} className={`p-5 rounded-xl border flex flex-col min-w-[160px] ${day.status === 'Focus' ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-700 shadow-sm' : 'bg-gray-50 dark:bg-slate-800/80 border-gray-200 dark:border-slate-600 opacity-90'}`}>
            <h3 className="font-bold text-lg mb-1 text-slate-800 dark:text-white">{day.dayName}</h3>
            <select
              value={day.status}
              onChange={(e) => onUpdateDayStatus(day.dayName, e.target.value as DayStatus)}
              className={`text-[10px] uppercase font-bold tracking-wider mb-3 block w-full py-1.5 px-2 rounded border bg-white dark:bg-slate-700 ${day.status === 'Rest' ? 'text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-700' : 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'}`}
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <div className="space-y-3 flex-grow">
              {day.blocks.map(block => (
                <div key={block.id} className="group relative p-3 rounded-lg bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 shadow-sm text-sm hover:border-indigo-200 dark:hover:border-indigo-500 transition-colors">
                  <button
                    onClick={() => onRemoveTask(day.dayName, block.id)}
                    className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 text-slate-300 dark:text-slate-400 hover:text-red-500 transition-opacity"
                    title="Sil"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-1 mb-1">
                    <span className={`w-2 h-2 rounded-full ${block.priority === Priority.HIGH ? 'bg-red-500' : 'bg-yellow-500'}`} />
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase">{block.category}</span>
                  </div>
                  {editingTask?.dayName === day.dayName && editingTask?.taskId === block.id ? (
                    <div className="space-y-1">
                      <input
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEditTask()}
                        onBlur={saveEditTask}
                        className="w-full text-sm p-1.5 border border-indigo-200 dark:border-indigo-600 rounded bg-white dark:bg-slate-600 text-slate-800 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                        placeholder="Görev adı"
                      />
                      <input
                        type="time"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        onBlur={saveEditTask}
                        className="w-full text-xs p-1 border border-slate-200 dark:border-slate-500 rounded bg-white dark:bg-slate-600 text-slate-800 dark:text-white"
                      />
                      <p className="text-[10px] text-slate-400 dark:text-slate-400">Başlık + saat sonra dışarı tıkla = kaydet</p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEditTask(day.dayName, block)}
                      className="text-left w-full group/title"
                    >
                      <p className="font-semibold text-slate-700 dark:text-slate-200 leading-tight group-hover/title:text-indigo-600 dark:group-hover/title:text-indigo-400 group-hover/title:underline">{block.title}</p>
                    </button>
                  )}
                  <div className="flex items-center justify-between gap-1 mt-1">
                    <p className="text-[10px] text-slate-400 dark:text-slate-400">{block.duration} dk</p>
                    {block.time && (
                      <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400" title="Saat">{block.time}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {addingToDay === day.dayName ? (
              <div className="mt-4 p-3 bg-white dark:bg-slate-700 border border-indigo-100 dark:border-indigo-800 rounded-lg shadow-inner space-y-2">
                <input
                  autoFocus
                  className="w-full text-xs p-2 border border-slate-200 dark:border-slate-500 rounded bg-white dark:bg-slate-600 text-slate-800 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="Görev adı (örn. Toplantı)"
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                />
                <input
                  type="time"
                  className="w-full text-xs p-2 border border-slate-200 dark:border-slate-500 rounded bg-white dark:bg-slate-600 text-slate-800 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="Saat (opsiyonel)"
                  value={newTask.time ?? ''}
                  onChange={e => setNewTask({...newTask, time: e.target.value || undefined})}
                />
                <div className="flex gap-2">
                  <select
                    className="flex-1 text-[10px] p-1 border border-slate-200 dark:border-slate-500 rounded bg-white dark:bg-slate-600 text-slate-800 dark:text-white"
                    value={goals.includes(newTask.category) ? newTask.category : defaultCategory}
                    onChange={e => setNewTask({...newTask, category: e.target.value})}
                  >
                    {goals.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <select
                    className="flex-1 text-[10px] p-1 border border-slate-200 dark:border-slate-500 rounded bg-white dark:bg-slate-600 text-slate-800 dark:text-white"
                    value={newTask.duration}
                    onChange={e => setNewTask({...newTask, duration: Number(e.target.value)})}
                  >
                    <option value={30}>30 dk</option>
                    <option value={60}>60 dk</option>
                    <option value={90}>90 dk</option>
                    <option value={120}>120 dk</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddSubmit(day.dayName)}
                    className="flex-1 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded hover:bg-indigo-700"
                  >
                    Ekle
                  </button>
                  <button
                    onClick={() => setAddingToDay(null)}
                    className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-200 text-[10px] font-bold rounded hover:bg-slate-200 dark:hover:bg-slate-500"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingToDay(day.dayName)}
                className="mt-4 flex items-center justify-center gap-2 p-2 border border-dashed border-slate-300 dark:border-slate-500 rounded-lg text-slate-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-white dark:hover:bg-slate-700 transition-all text-xs font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Görev Ekle
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
