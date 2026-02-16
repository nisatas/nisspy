import { createClient } from '@supabase/supabase-js';
import type { DaySchedule, RoadmapStep, SprintWeek } from '../types';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase ayarları eksik. .env.local dosyasında VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY tanımlayın. ' +
    'Değişken adları tam olarak böyle olmalı. Kaydettikten sonra sunucuyu durdurup tekrar "npm run dev" çalıştırın.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserScheduleRow {
  id?: number;
  user_id: string;
  schedule: DaySchedule[];
  updated_at?: string;
}

export async function getSchedule(userId: string): Promise<DaySchedule[] | null> {
  const { data, error } = await supabase
    .from('user_schedules')
    .select('schedule')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.error('getSchedule error', error);
    return null;
  }
  return data?.schedule ?? null;
}

export async function saveSchedule(userId: string, schedule: DaySchedule[]): Promise<boolean> {
  const { error } = await supabase
    .from('user_schedules')
    .upsert(
      { user_id: userId, schedule, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  if (error) {
    console.error('saveSchedule error', error);
    return false;
  }
  return true;
}

// --- Profil (avatar, display_name) ---
export type MotivationMode = 'normal' | 'low';

export interface FocusBlock {
  duration: number;
  label: string;
}

export interface UserProfile {
  user_id: string;
  avatar_url: string | null;
  display_name: string | null;
  motivation_mode?: MotivationMode | null;
  focus_blocks?: FocusBlock[] | null;
  /** Kullanıcının hedef/kategori listesi (örn. React, Java, ALES) */
  goals?: string[] | null;
  /** Hedef bazlı yol haritaları: { "React": RoadmapStep[], ... } */
  roadmaps?: Record<string, RoadmapStep[]> | null;
  /** Sprint haftaları */
  sprints?: SprintWeek[] | null;
  updated_at?: string;
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, avatar_url, display_name, motivation_mode, focus_blocks, goals, roadmaps, sprints, updated_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.error('getProfile error', error);
    return null;
  }
  return data;
}

export async function updateProfile(userId: string, updates: { avatar_url?: string | null; display_name?: string | null; motivation_mode?: MotivationMode | null; focus_blocks?: FocusBlock[] | null; goals?: string[] | null; roadmaps?: Record<string, RoadmapStep[]> | null; sprints?: SprintWeek[] | null }): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .upsert(
      { user_id: userId, ...updates, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  if (error) {
    console.error('updateProfile error', error);
    return false;
  }
  return true;
}

const AVATARS_BUCKET = 'avatars';

export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from(AVATARS_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });
  if (uploadError) {
    console.error('uploadAvatar error', uploadError);
    return null;
  }
  const { data: urlData } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  return urlData?.publicUrl ?? null;
}
