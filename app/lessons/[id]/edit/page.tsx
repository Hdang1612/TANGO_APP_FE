'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useParams, useRouter } from 'next/navigation';
import { LessonForm, LessonFormValues } from '@/components/LessonForm';

export default function EditLessonPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const { lessons, fetchLessons, fetchLessonById, isLoading } = useStore();
  const lesson = lessons.find((l) => l.id === id);
  const updateLesson = useStore((state) => state.updateLesson);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  useEffect(() => {
    if (!lesson) {
      if (lessons.length === 0) {
        fetchLessons().finally(() => setHasAttemptedFetch(true));
      } else {
        fetchLessonById(id).finally(() => setHasAttemptedFetch(true));
      }
    } else {
      setHasAttemptedFetch(true);
    }
  }, [id, lesson, lessons.length, fetchLessons, fetchLessonById]);

  if (!hasAttemptedFetch || isLoading || (!lesson && lessons.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-3 animate-in fade-in">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Đang tải bài học...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in">
        <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy bài học</h2>
        <button onClick={() => router.push('/')} className="px-4 py-2 bg-slate-100 rounded-md cursor-pointer">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const onSubmit = async (data: LessonFormValues) => {
    await updateLesson(id, {
      title: data.title,
      description: data.description || '',
      vocabularies: (data.vocabularies || []).map((v) => ({
        ...(v.id ? { id: v.id } : {}),
        japanese: v.japanese || '',
        vietnamese: v.vietnamese || '',
        hanViet: v.hanViet || '',
      })),
    });
    router.push('/');
  };

  return (
    <LessonForm 
      mode="vocabulary"
      initialData={lesson}
      pageTitle="Chỉnh sửa bài học từ vựng"
      pageDescription="Cập nhật chủ đề và danh sách từ vựng."
      onSubmit={onSubmit}
      backHref="/"
    />
  );
}
