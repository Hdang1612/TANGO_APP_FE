'use client';

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { Lesson } from '@/types';
import { LessonForm, LessonFormValues } from '@/components/LessonForm';

export default function CreateKanjiLessonPage() {
  const addLesson = useStore((state) => state.addLesson);
  const router = useRouter();

  const onSubmit = async (data: LessonFormValues) => {
    const newLesson: Lesson = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description || '',
      createdAt: new Date().toISOString(),
      vocabularies: [],
      kanjis: (data.kanjis || []).map((k) => ({
        id: crypto.randomUUID(),
        character: k.character || '',
        meaning: k.meaning || '',
        hanViet: k.hanViet || '',
        onYomi: k.onYomi || '',
        kunYomi: k.kunYomi || '',
        examples: k.examples || [],
      })),
    };

    await addLesson(newLesson);
    router.push('/kanji-lessons');
  };

  return (
    <LessonForm 
      mode="kanji"
      pageTitle="Tạo bài học Hán tự mới"
      pageDescription="Thêm chủ đề và danh sách các chữ Hán cần học."
      onSubmit={onSubmit} 
      backHref="/kanji-lessons"
    />
  );
}
