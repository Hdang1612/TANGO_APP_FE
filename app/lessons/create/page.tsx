'use client';

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { Lesson } from '@/types';
import { LessonForm, LessonFormValues } from '@/components/LessonForm';

export default function CreateLessonPage() {
  const addLesson = useStore((state) => state.addLesson);
  const router = useRouter();

  const onSubmit = (data: LessonFormValues) => {
    const newLesson: Lesson = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description || '',
      createdAt: new Date().toISOString(),
      vocabularies: data.vocabularies.map((v) => ({
        id: crypto.randomUUID(),
        japanese: v.japanese,
        vietnamese: v.vietnamese,
        hanViet: v.hanViet,
      })),
      kanjis: data.kanjis?.map((k) => ({
        id: crypto.randomUUID(),
        character: k.character,
        meaning: k.meaning,
        hanViet: k.hanViet,
      })) || [],
    };

    addLesson(newLesson);
    router.push('/');
  };

  return (
    <LessonForm 
      pageTitle="Create New Lesson"
      pageDescription="Add a new topic and its vocabulary words."
      onSubmit={onSubmit} 
    />
  );
}
