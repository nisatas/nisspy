
import { Priority, DaySchedule, RoadmapStep, SprintWeek } from './types';

export const WEEKLY_SCHEDULE: DaySchedule[] = [
  {
    dayName: 'Pazartesi',
    status: 'Trainee',
    blocks: [
      { id: '1', title: 'ALES Isınma (Paragraf/Mantık)', duration: 45, priority: Priority.MEDIUM, category: 'ALES' }
    ]
  },
  {
    dayName: 'Salı',
    status: 'School',
    blocks: [
      { id: '2', title: 'React Hooks & Advanced Patterns', duration: 90, priority: Priority.HIGH, category: 'React' },
      { id: '3', title: 'Java OOP Principles', duration: 60, priority: Priority.HIGH, category: 'Java' }
    ]
  },
  {
    dayName: 'Çarşamba',
    status: 'Focus',
    blocks: [
      { id: '4', title: 'ML: Numpy & Pandas Deep Dive', duration: 90, priority: Priority.MEDIUM, category: 'ML' },
      { id: '5', title: 'React: Context API & Redux', duration: 90, priority: Priority.HIGH, category: 'React' },
      { id: '6', title: 'Java: Data Structures Basics', duration: 90, priority: Priority.HIGH, category: 'Java' }
    ]
  },
  {
    dayName: 'Perşembe',
    status: 'Trainee',
    blocks: [
      { id: '7', title: 'AI Tools SDK Integration', duration: 60, priority: Priority.LOW, category: 'AI', description: 'Trainee projelerine entegrasyon denemesi.' }
    ]
  },
  {
    dayName: 'Cuma',
    status: 'Rest',
    blocks: [
      { id: '8', title: 'ALES Mantık Çözümleri', duration: 60, priority: Priority.LOW, category: 'ALES' }
    ]
  },
  {
    dayName: 'Cumartesi',
    status: 'Trainee',
    blocks: []
  },
  {
    dayName: 'Pazar',
    status: 'Focus',
    blocks: [
      { id: '9', title: 'Haftalık Strateji & Recap', duration: 60, priority: Priority.MEDIUM, category: 'Strategy' },
      { id: '10', title: 'Full Stack Project Build (AI Integrated)', duration: 120, priority: Priority.HIGH, category: 'React' }
    ]
  }
];

export const ROADMAPS: Record<string, RoadmapStep[]> = {
  React: [
    { title: 'Advanced Hooks', details: ['useMemo, useCallback, useReducer', 'Custom Hooks yazımı'], status: 'in-progress' },
    { title: 'State Management', details: ['Context API vs Redux Toolkit', 'Slice mantığı ve AsyncThunk'], status: 'pending' },
    { title: 'Auth & Security', details: ['JWT Integration', 'Protected Routes', 'Axios Interceptors'], status: 'pending' }
  ],
  Java: [
    { title: 'OOP Fundamentals', details: ['Inheritance, Polymorphism', 'Interfaces vs Abstract Classes'], status: 'in-progress' },
    { title: 'Collections & DS', details: ['ArrayList, HashMap, LinkedList', 'Generic Types'], status: 'pending' },
    { title: 'Career Prep', details: ['Exception Handling', 'Maven/Gradle Basics', 'Spring Boot Intro'], status: 'pending' }
  ],
  ML: [
    { title: 'Foundations', details: ['Python for Data Science', 'Numpy/Pandas Mastery'], status: 'in-progress' },
    { title: 'Data Viz', details: ['Matplotlib & Seaborn', 'Exploratory Data Analysis'], status: 'pending' },
    { title: 'Algorithms', details: ['Linear Regression', 'K-Nearest Neighbors', 'Scikit-learn Workflow'], status: 'pending' }
  ]
};

export const SPRINTS: SprintWeek[] = [
  {
    week: 1,
    focus: 'React Context & Java OOP',
    tasks: ['useContext ile Tema yönetimi', 'Java Inheritance alıştırmaları', 'Numpy Array operasyonları', 'ALES Paragraf rutini']
  },
  {
    week: 2,
    focus: 'Redux Toolkit & Java Abstract',
    tasks: ['Redux Toolkit Store kurulumu', 'Abstract sınıflar ve Interface farkı', 'Pandas DataFrame manipülasyonu', 'AI Prompt Engineering denemeleri']
  },
  {
    week: 3,
    focus: 'Auth Logic & Data Structures',
    tasks: ['JWT Login ekranı tasarımı', 'ArrayList ve LinkedList performans testi', 'ML: EDA süreçleri', 'ALES Sözel Mantık temelleri']
  },
  {
    week: 4,
    focus: 'Full Project Merge',
    tasks: ['AI API ile çalışan React Dashboard', 'Java ile basit bir Backend API (Mock)', 'ALES Deneme çözümü (Isınma)']
  }
];

/** Hedeflere göre varsayılan yol haritaları (ROADMAPS'tan kopya). */
export function getDefaultRoadmaps(goals: string[]): Record<string, RoadmapStep[]> {
  const keys = goals.length > 0 ? goals.filter((g) => g in ROADMAPS) : Object.keys(ROADMAPS);
  const out: Record<string, RoadmapStep[]> = {};
  for (const k of keys) {
    if (ROADMAPS[k]) out[k] = ROADMAPS[k].map((s) => ({ ...s, details: [...s.details] }));
  }
  return out;
}
