
export enum Priority {
  HIGH = 'Yüksek',
  MEDIUM = 'Orta',
  LOW = 'Düşük'
}

export interface TaskBlock {
  id: string;
  title: string;
  duration: number; // minutes
  priority: Priority;
  /** Kullanıcının hedeflerinden biri (Profil'den yönetilir) */
  category: string;
  description?: string;
  /** Opsiyonel saat (örn. "19:30" toplantı için) */
  time?: string;
}

export interface DaySchedule {
  dayName: string;
  status: 'Trainee' | 'School' | 'Rest' | 'Focus';
  blocks: TaskBlock[];
}

export interface RoadmapStep {
  title: string;
  details: string[];
  status: 'pending' | 'in-progress' | 'completed';
}

export interface SprintWeek {
  week: number;
  focus: string;
  tasks: string[];
}
