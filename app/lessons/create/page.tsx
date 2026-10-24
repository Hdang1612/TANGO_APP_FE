'use client';

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { Lesson } from '@/types';
import { LessonForm, LessonFormValues } from '@/components/LessonForm';

export default function CreateLessonPage() {
  const addLesson = useStore((state) => state.addLesson);
  const router = useRouter();

  const onSubmit = async (data: LessonFormValues) => {
    const newLesson: Lesson = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description || '',
      createdAt: new Date().toISOString(),
      vocabularies: (data.vocabularies || []).map((v) => ({
        id: crypto.randomUUID(),
        japanese: v.japanese || '',
        vietnamese: v.vietnamese || '',
        hanViet: v.hanViet || '',
      })),
      kanjis: [],
    };

    await addLesson(newLesson);
    router.push('/');
  };

  return (
    <LessonForm 
      mode="vocabulary"
      pageTitle="Tạo bài học từ vựng mới"
      pageDescription="Thêm chủ đề và danh sách các từ vựng cần học."
      onSubmit={onSubmit} 
      backHref="/"
    />
  );
}
