import { create } from 'zustand';
import { Lesson, Vocabulary } from '@/types';

interface AppState {
  lessons: Lesson[];
  addLesson: (lesson: Lesson) => void;
  updateLesson: (id: string, lesson: Partial<Lesson>) => void;
  deleteLesson: (id: string) => void;
}

const initialLessons: Lesson[] = [
  {
    id: '1',
    title: 'Greeting Basics',
    description: 'Learn how to greet people in Japanese.',
    createdAt: new Date().toISOString(),
    vocabularies: [
      { id: '1-1', japanese: 'こんにちは', vietnamese: 'Xin chào (buổi chiều)' },
      { id: '1-2', japanese: 'おはようございます', vietnamese: 'Chào buổi sáng' },
      { id: '1-3', japanese: 'こんばんは', vietnamese: 'Chào buổi tối' },
      { id: '1-4', japanese: 'ありがとう', vietnamese: 'Cảm ơn' },
    ],
  },
  {
    id: '2',
    title: 'Food and Drinks',
    description: 'Essential vocabulary for eating out.',
    createdAt: new Date().toISOString(),
    vocabularies: [
      { id: '2-1', japanese: '水', vietnamese: 'Nước' },
      { id: '2-2', japanese: 'ご飯', vietnamese: 'Cơm' },
      { id: '2-3', japanese: '肉', vietnamese: 'Thịt' },
      { id: '2-4', japanese: '魚', vietnamese: 'Cá' },
      { id: '2-5', japanese: '野菜', vietnamese: 'Rau' },
    ],
  }
];

export const useStore = create<AppState>((set) => ({
  lessons: initialLessons,
  addLesson: (lesson) =>
    set((state) => ({ lessons: [...state.lessons, lesson] })),
  updateLesson: (id, updatedFields) =>
    set((state) => ({
      lessons: state.lessons.map((lesson) =>
        lesson.id === id ? { ...lesson, ...updatedFields } : lesson
      ),
    })),
  deleteLesson: (id) =>
    set((state) => ({
      lessons: state.lessons.filter((lesson) => lesson.id !== id),
    })),
}));
