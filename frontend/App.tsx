import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Dashboard from './components/Dashboard';
import Roadmaps from './components/Roadmaps';
import SprintPlanner from './components/SprintPlanner';
import CoachChat from './components/CoachChat';
import LightModePlan from './components/LightModePlan';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import UserMenu from './components/UserMenu';
import Logo from './components/Logo';
import { WEEKLY_SCHEDULE as INITIAL_SCHEDULE, getDefaultRoadmaps, SPRINTS } from './constants';
import { DaySchedule, TaskBlock } from './types';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { getSchedule, saveSchedule, getProfile, updateProfile, type MotivationMode } from './lib/supabase';

const App: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [authScreen, setAuthScreen] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'roadmaps' | 'sprint' | 'coach' | 'profile'>('dashboard');
  const [schedule, setSchedule] = useState<DaySchedule[]>(INITIAL_SCHEDULE);
  const [scheduleLoaded, setScheduleLoaded] = useState(false);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [profileDisplayName, setProfileDisplayName] = useState<string | null>(null);
  const [profileMotivationMode, setProfileMotivationMode] = useState<MotivationMode>('normal');
  const [profileFocusBlocks, setProfileFocusBlocks] = useState<{ duration: number; label: string }[] | null>(null);
  const [profileGoals, setProfileGoals] = useState<string[] | null>(null);
  const [profileRoadmaps, setProfileRoadmaps] = useState<Record<string, { title: string; details: string[]; status: string }[]> | null>(null);
  const [profileSprints, setProfileSprints] = useState<{ week: number; focus: string; tasks: string[] }[] | null>(null);

  // Giriş yapınca veritabanından planı yükle
  useEffect(() => {
    if (!user?.id) {
      setScheduleLoaded(false);
      return;
    }
    let cancelled = false;
    getSchedule(user.id).then((saved) => {
      if (!cancelled && saved && saved.length > 0) {
        setSchedule(saved);
      }
      if (!cancelled) setScheduleLoaded(true);
    });
    return () => { cancelled = true; };
  }, [user?.id]);

  // Profil avatarını nav için yükle
  useEffect(() => {
    if (!user?.id) {
      setProfileAvatarUrl(null);
      return;
    }
    getProfile(user.id).then((p) => {
      if (p?.avatar_url) setProfileAvatarUrl(p.avatar_url);
      else setProfileAvatarUrl(null);
      setProfileDisplayName(p?.display_name ?? null);
      setProfileMotivationMode(p?.motivation_mode === 'low' ? 'low' : 'normal');
      setProfileFocusBlocks(p?.focus_blocks ?? null);
      setProfileGoals(p?.goals ?? null);
      setProfileRoadmaps(p?.roadmaps ?? null);
      setProfileSprints(p?.sprints ?? null);
    });
  }, [user?.id]);

  const effectiveRoadmaps = useMemo(
    () => (profileRoadmaps != null && Object.keys(profileRoadmaps).length > 0)
      ? profileRoadmaps
      : getDefaultRoadmaps(profileGoals ?? []),
    [profileRoadmaps, profileGoals]
  );
  const effectiveSprints = useMemo(
    () => (profileSprints != null && profileSprints.length > 0) ? profileSprints : SPRINTS,
    [profileSprints]
  );

  // Plan değişince (debounce) Supabase'e kaydet
  useEffect(() => {
    if (!user?.id || !scheduleLoaded) return;
    const timer = setTimeout(() => {
      saveSchedule(user.id, schedule);
    }, 800);
    return () => clearTimeout(timer);
  }, [user?.id, schedule, scheduleLoaded]);

  const addTask = useCallback((dayName: string, newTask: Omit<TaskBlock, 'id'>) => {
    setSchedule(prev => prev.map(day => {
      if (day.dayName === dayName) {
        return {
          ...day,
          blocks: [...day.blocks, { ...newTask, id: crypto.randomUUID() }]
        };
      }
      return day;
    }));
  }, []);

  const removeTask = useCallback((dayName: string, taskId: string) => {
    setSchedule(prev => prev.map(day => {
      if (day.dayName === dayName) {
        return {
          ...day,
          blocks: day.blocks.filter(block => block.id !== taskId)
        };
      }
      return day;
    }));
  }, []);

  const updateDayStatus = useCallback((dayName: string, status: 'Trainee' | 'School' | 'Rest' | 'Focus') => {
    setSchedule(prev => prev.map(day =>
      day.dayName === dayName ? { ...day, status } : day
    ));
  }, []);

  const updateTask = useCallback((dayName: string, taskId: string, updates: Partial<Pick<TaskBlock, 'title' | 'duration' | 'category' | 'time'>>) => {
    setSchedule(prev => prev.map(day => {
      if (day.dayName !== dayName) return day;
      return {
        ...day,
        blocks: day.blocks.map(block =>
          block.id === taskId ? { ...block, ...updates } : block
        )
      };
    }));
  }, []);

  const setMotivationMode = useCallback((mode: MotivationMode) => {
    if (!user?.id) return;
    setProfileMotivationMode(mode);
    updateProfile(user.id, { motivation_mode: mode });
  }, [user?.id]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return authScreen === 'login' ? (
      <Login onSwitchToSignup={() => setAuthScreen('signup')} />
    ) : (
      <Signup onSwitchToLogin={() => setAuthScreen('login')} />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-xl font-bold text-slate-800 dark:text-white hidden sm:inline">NISSPY</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              title={theme === 'dark' ? 'Açık tema' : 'Koyu tema'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl flex-wrap">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                Haftalık Plan
              </button>
              <button
                onClick={() => setActiveTab('roadmaps')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'roadmaps' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                Yol Haritaları
              </button>
              <button
                onClick={() => setActiveTab('sprint')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'sprint' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                Sprint Planı
              </button>
              <button
                onClick={() => setActiveTab('coach')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'coach' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                Yapay Zeka Koçu
              </button>
            </div>
            <UserMenu
              displayName={profileDisplayName}
              userEmail={user.email ?? ''}
              avatarUrl={profileAvatarUrl}
              onProfileClick={() => setActiveTab('profile')}
              onSignOut={signOut}
            />
          </div>
        </div>
      </nav>

      <main className={`mx-auto px-6 py-8 ${activeTab === 'dashboard' ? 'max-w-[1600px]' : 'max-w-7xl'}`}>
        {activeTab === 'coach' && (
          <div className="max-w-2xl mx-auto">
            <CoachChat motivationMode={profileMotivationMode} />
          </div>
        )}
        {activeTab === 'profile' && (
          <Profile
            userId={user.id}
            userEmail={user.email ?? ''}
            onAvatarChange={setProfileAvatarUrl}
            onDisplayNameChange={setProfileDisplayName}
            onFocusBlocksChange={setProfileFocusBlocks}
            onGoalsChange={setProfileGoals}
          />
        )}
        {(activeTab === 'dashboard' || activeTab === 'roadmaps' || activeTab === 'sprint') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className={activeTab === 'dashboard' ? 'lg:col-span-10 space-y-8' : 'lg:col-span-8 space-y-8'}>
              {activeTab === 'dashboard' && (
                <Dashboard
                  schedule={schedule}
                  goals={profileGoals ?? ['React', 'Java', 'ML', 'AI', 'ALES', 'Strategy']}
                  onAddTask={addTask}
                  onRemoveTask={removeTask}
                  onUpdateDayStatus={updateDayStatus}
                  onUpdateTask={updateTask}
                />
              )}
              {activeTab === 'roadmaps' && (
                <Roadmaps
                  roadmaps={effectiveRoadmaps}
                  goals={profileGoals ?? []}
                  onSave={async (r) => {
                    if (!user?.id) return;
                    const ok = await updateProfile(user.id, { roadmaps: r });
                    if (ok) setProfileRoadmaps(r);
                  }}
                />
              )}
              {activeTab === 'sprint' && (
                <SprintPlanner
                  sprints={effectiveSprints}
                  onSave={async (s) => {
                    if (!user?.id) return;
                    const ok = await updateProfile(user.id, { sprints: s });
                    if (ok) setProfileSprints(s);
                  }}
                />
              )}
            </div>

            <div className={activeTab === 'dashboard' ? 'lg:col-span-2 space-y-8' : 'lg:col-span-4 space-y-8'}>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-widest text-xs">Odak Blok Sistemi</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Bugün nasıl hissediyorsun?</p>
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setMotivationMode('normal')}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${profileMotivationMode === 'normal' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setMotivationMode('low')}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${profileMotivationMode === 'low' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                  >
                    Düşük motivasyon
                  </button>
                </div>
                {profileMotivationMode === 'low' ? (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Kısa bloklar önerilir (30 dk)</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">Teknik blokları 15–30 dk ile sınırla, hafif modda ilerle.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(profileFocusBlocks ?? [
                      { duration: 90, label: 'Teknik / Deep Work' },
                      { duration: 60, label: 'Tekrar / Proje' },
                      { duration: 30, label: 'ALES / Isınma' },
                    ]).map((block, i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800">
                        <span className="font-bold text-indigo-700 dark:text-indigo-300">{block.duration} Dakika</span>
                        <span className="text-xs text-indigo-600 dark:text-indigo-400">{block.label}</span>
                      </div>
                    ))}
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Blokları Profil sayfasından özelleştirebilirsin.</p>
                  </div>
                )}
              </div>

              <LightModePlan motivationMode={profileMotivationMode} />
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-slate-200 dark:border-slate-700 py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
        <p>© 2026 NISSPY – Teknik & Akademik Başarı Asistanı</p>
      </footer>
    </div>
  );
};

export default App;
