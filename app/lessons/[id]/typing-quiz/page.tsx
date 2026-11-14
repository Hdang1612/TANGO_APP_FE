"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { VocabularyTypingQuizView } from "@/components/quiz/VocabularyTypingQuizView";
import { Loader2 } from "lucide-react";

export default function TypingQuizPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { lessons, fetchLessons, fetchLessonById, isLoading } = useStore();
  const lesson = lessons.find((l) => l.id === id);
  const words = useMemo(
    () => lesson?.vocabularies || [],
    [lesson?.vocabularies]
  );
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
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Đang tải bài học...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Không tìm thấy bài học
        </h2>
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="cursor-pointer"
        >
          Về trang chủ
        </Button>
      </div>
    );
  }

  return (
    <VocabularyTypingQuizView
      words={words}
      title={lesson.title}
      subtitle="Chế độ nhập từ vựng"
      backHref={`/lessons/${id}`}
    />
  );
}
