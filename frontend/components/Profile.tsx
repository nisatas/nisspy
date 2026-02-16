import React, { useState, useEffect, useRef } from 'react';
import { getProfile, updateProfile, uploadAvatar, type FocusBlock } from '../lib/supabase';

const DEFAULT_FOCUS_BLOCKS: FocusBlock[] = [
  { duration: 90, label: 'Teknik / Deep Work' },
  { duration: 60, label: 'Tekrar / Proje' },
  { duration: 30, label: 'ALES / Isınma' },
];

const DEFAULT_GOALS = ['React', 'Java', 'ML', 'AI', 'ALES', 'Strategy'];

interface ProfileProps {
  userId: string;
  userEmail: string;
  onAvatarChange?: (avatarUrl: string | null) => void;
  onDisplayNameChange?: (name: string | null) => void;
  onFocusBlocksChange?: (blocks: FocusBlock[] | null) => void;
  onGoalsChange?: (goals: string[] | null) => void;
}

const Profile: React.FC<ProfileProps> = ({
  userId,
  userEmail,
  onAvatarChange,
  onDisplayNameChange,
  onFocusBlocksChange,
  onGoalsChange,
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [focusBlocks, setFocusBlocks] = useState<FocusBlock[]>(DEFAULT_FOCUS_BLOCKS);
  const [goals, setGoals] = useState<string[]>(DEFAULT_GOALS);
  const [newGoalLabel, setNewGoalLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    getProfile(userId).then((p) => {
      if (!cancelled && p) {
        setAvatarUrl(p.avatar_url ?? null);
        setDisplayName(p.display_name ?? '');
        setFocusBlocks(p.focus_blocks?.length ? p.focus_blocks : DEFAULT_FOCUS_BLOCKS);
        setGoals(p.goals?.length ? p.goals : DEFAULT_GOALS);
      }
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [userId]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setSaving(true);
    setMessage('');
    const url = await uploadAvatar(userId, file);
    if (url) {
      await updateProfile(userId, { avatar_url: url });
      setAvatarUrl(url);
      onAvatarChange?.(url);
      setMessage('Fotoğraf güncellendi.');
    } else {
      setMessage('Yükleme başarısız. Supabase Storage\'da avatars bucket\'ı oluşturup RLS ayarlayın.');
    }
    setSaving(false);
    e.target.value = '';
  };

  const handleSaveName = async () => {
    setSaving(true);
    setMessage('');
    const ok = await updateProfile(userId, { display_name: displayName.trim() || null });
    if (ok) {
      setMessage('Profil kaydedildi.');
      onDisplayNameChange?.(displayName.trim() || null);
    } else setMessage('Kaydetme başarısız.');
    setSaving(false);
  };

  const handleSaveFocusBlocks = async () => {
    setSaving(true);
    setMessage('');
    const ok = await updateProfile(userId, { focus_blocks: focusBlocks });
    if (ok) {
      setMessage('Odak blokları kaydedildi.');
      onFocusBlocksChange?.(focusBlocks);
    } else setMessage('Kaydetme başarısız.');
    setSaving(false);
  };

  const addFocusBlock = () => setFocusBlocks((prev) => [...prev, { duration: 60, label: 'Yeni blok' }]);
  const removeFocusBlock = (i: number) => setFocusBlocks((prev) => prev.filter((_, idx) => idx !== i));
  const updateFocusBlock = (i: number, upd: Partial<FocusBlock>) =>
    setFocusBlocks((prev) => prev.map((b, idx) => (idx === i ? { ...b, ...upd } : b)));

  const handleSaveGoals = async () => {
    setSaving(true);
    setMessage('');
    const ok = await updateProfile(userId, { goals });
    if (ok) {
      setMessage('Hedefler kaydedildi.');
      onGoalsChange?.(goals);
    } else setMessage('Kaydetme başarısız.');
    setSaving(false);
  };
  const addGoal = () => {
    const t = newGoalLabel.trim();
    if (!t || goals.includes(t)) return;
    setGoals((prev) => [...prev, t]);
    setNewGoalLabel('');
  };
  const removeGoal = (i: number) => setGoals((prev) => prev.filter((_, idx) => idx !== i));

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Profilim</h1>
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profil" className="w-28 h-28 rounded-full object-cover border-4 border-slate-100 dark:border-slate-600" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-4xl border-4 border-slate-100 dark:border-slate-600">
                {(displayName || userEmail).charAt(0).toUpperCase()}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
              className="absolute bottom-0 right-0 w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 disabled:opacity-50"
              title="Fotoğraf değiştir"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">İsim Soyisim</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Adınız Soyadınız"
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ana sayfada e-posta yerine bu isim gösterilir.</p>
            <button
              type="button"
              onClick={handleSaveName}
              disabled={saving}
              className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">E-posta (giriş)</label>
              <p className="text-sm text-slate-600 dark:text-slate-300">{userEmail}</p>
            </div>
          </div>
        </div>
        {message && (
          <p className={`text-sm ${message.includes('başarısız') ? 'text-red-600' : 'text-emerald-600 dark:text-emerald-400'}`}>{message}</p>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-8">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Odak Bloklarım</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Sidebar’daki Odak Blok Sistemi bu listeye göre gösterilir. Süre (dakika) ve etiketleri düzenleyebilirsin.</p>
        <div className="space-y-3">
          {focusBlocks.map((block, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="number"
                min={5}
                max={180}
                value={block.duration}
                onChange={(e) => updateFocusBlock(i, { duration: Number(e.target.value) || 30 })}
                className="w-20 px-2 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
              />
              <span className="text-slate-500 dark:text-slate-400 text-sm">dk</span>
              <input
                type="text"
                value={block.label}
                onChange={(e) => updateFocusBlock(i, { label: e.target.value })}
                className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                placeholder="Etiket"
              />
              <button
                type="button"
                onClick={() => removeFocusBlock(i)}
                className="p-2 text-slate-400 hover:text-red-500"
                title="Kaldır"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={addFocusBlock} className="px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg">
            + Blok ekle
          </button>
          <button type="button" onClick={handleSaveFocusBlocks} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50">
            Blokları kaydet
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-8">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Hedeflerim</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Haftalık planda görev eklerken kategoriler bu listeden gelir. Hedef ekleyip kaldırabilirsin.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {goals.map((g, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 text-sm font-medium"
            >
              {g}
              <button type="button" onClick={() => removeGoal(i)} className="ml-1 p-0.5 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800" title="Kaldır" aria-label="Kaldır">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            value={newGoalLabel}
            onChange={(e) => setNewGoalLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
            placeholder="Yeni hedef (örn. İngilizce)"
            className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm w-48"
          />
          <button type="button" onClick={addGoal} className="px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg">
            + Ekle
          </button>
          <button type="button" onClick={handleSaveGoals} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50">
            Hedefleri kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
