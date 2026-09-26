'use client';

import { useStore } from '@/store/useStore';
import { useParams, useRouter } from 'next/navigation';
import { LessonForm, LessonFormValues } from '@/components/LessonForm';

export default function EditLessonPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const lesson = useStore((state) => state.lessons.find((l) => l.id === id));
  const updateLesson = useStore((state) => state.updateLesson);

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in">
        <h2 className="text-2xl font-bold text-slate-800">Lesson not found</h2>
        <button onClick={() => router.push('/')} className="px-4 py-2 bg-slate-100 rounded-md cursor-pointer">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const onSubmit = (data: LessonFormValues) => {
    updateLesson(id, {
      title: data.title,
      description: data.description,
      vocabularies: data.vocabularies.map((v) => ({
        id: v.id || crypto.randomUUID(),
        japanese: v.japanese,
        vietnamese: v.vietnamese,
      })),
    });
    router.push('/');
  };

  return (
    <LessonForm 
      initialData={lesson}
      pageTitle="Edit Lesson"
      pageDescription="Update the topic and vocabulary words."
      onSubmit={onSubmit} 
    />
  );
}
