'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import Link from 'next/link';

export default function KanjiFlashcardsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { lessons, fetchLessons, fetchLessonById, isLoading } = useStore();
  const lesson = lessons.find((l) => l.id === id);
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const cards = (lesson?.kanjis || []).map((k) => ({
    character: k.character,
    hanViet: k.hanViet || '',
    meaning: k.meaning,
    onYomi: k.onYomi || '',
    kunYomi: k.kunYomi || '',
  }));

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, cards.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  if (!hasAttemptedFetch || isLoading || (!lesson && lessons.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-3 animate-in fade-in">
        <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Đang tải bài học...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in">
        <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy bài học</h2>
        <Button onClick={() => router.push('/kanji-lessons')} variant="outline">
          Quay lại
        </Button>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in">
        <h2 className="text-2xl font-bold text-slate-800">Bài học chưa có chữ Hán</h2>
        <Button onClick={() => router.push(`/lessons/${lesson.id}/edit`)} variant="outline">
          Thêm chữ Hán
        </Button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/kanji-lessons/${id}`}>
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <p className="text-slate-500 text-sm">Flashcard Hán tự</p>
          </div>
        </div>
        <div className="text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-3 py-1.5 rounded-full">
          {currentIndex + 1} / {cards.length}
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative w-full h-[440px] [perspective:1000px]">
        <div
          key={currentIndex}
          className={`w-full h-full relative transition-transform duration-700 [transform-style:preserve-3d] cursor-pointer shadow-xl rounded-2xl ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front Face: Big Kanji Character */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-8 hover:border-purple-300 transition-colors">
            <span className="text-slate-400 text-sm font-medium tracking-widest uppercase mb-6">
              Hán tự
            </span>
            <div className="text-[160px] leading-none font-bold text-slate-800 dark:text-slate-100 text-center select-none">
              {currentCard.character}
            </div>
            {currentCard.hanViet && (
              <div className="text-2xl text-purple-600 dark:text-purple-400 mt-4 font-semibold tracking-wide">
                {currentCard.hanViet}
              </div>
            )}
            <div className="absolute bottom-6 text-slate-400 flex items-center gap-2 text-sm">
              <RotateCw className="w-4 h-4" />
              Click hoặc nhấn Space để lật
            </div>
          </div>

          {/* Back Face: Meaning + Readings */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-purple-50 to-slate-50 dark:from-purple-950/40 dark:to-slate-900 rounded-2xl border border-purple-200 dark:border-purple-900 flex flex-col items-center justify-center p-8 gap-4">
            <span className="text-purple-400 dark:text-purple-300 text-sm font-medium tracking-widest uppercase">
              Nghĩa &amp; Âm đọc
            </span>

            {/* Meaning */}
            <div className="text-3xl md:text-4xl font-bold text-purple-900 dark:text-purple-100 text-center">
              {currentCard.meaning}
            </div>

            {/* Readings */}
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {currentCard.onYomi && (
                <div className="flex flex-col items-center bg-orange-100 dark:bg-orange-950/40 border border-orange-300 dark:border-orange-800 rounded-xl px-4 py-2.5">
                  <span className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">
                    Âm On
                  </span>
                  <span className="text-xl font-bold text-orange-800 dark:text-orange-300">
                    {currentCard.onYomi}
                  </span>
                </div>
              )}
              {currentCard.kunYomi && (
                <div className="flex flex-col items-center bg-green-100 dark:bg-green-950/40 border border-green-300 dark:border-green-800 rounded-xl px-4 py-2.5">
                  <span className="text-xs font-bold text-green-500 uppercase tracking-widest mb-1">
                    Âm Kun
                  </span>
                  <span className="text-xl font-bold text-green-800 dark:text-green-300">
                    {currentCard.kunYomi}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="lg"
          className="gap-2 w-32"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-5 h-5" />
          Trước
        </Button>

        <div className="flex-1 mx-8 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>

        <Button
          variant="default"
          size="lg"
          className="gap-2 w-32 bg-purple-600 hover:bg-purple-700 text-white"
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
        >
          Tiếp
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
      <div className="text-center text-slate-400 text-sm">
        Mẹo: Dùng phím mũi tên ⬅️ ➡️ để điều hướng
      </div>
    </div>
  );
}
