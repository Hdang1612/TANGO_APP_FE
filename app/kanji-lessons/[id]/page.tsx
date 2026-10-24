"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Presentation,
  BookOpen,
  Volume2,
  Edit2,
} from "lucide-react";

export default function KanjiLessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { lessons, fetchLessons, isLoading } = useStore();
  const lesson = lessons.find((l) => l.id === id);

  useEffect(() => {
    if (lessons.length === 0) {
      fetchLessons();
    }
  }, [lessons.length, fetchLessons]);

  useEffect(() => {
    if (lessons.length > 0 && !lesson) {
      router.push("/kanji-lessons");
    }
  }, [lessons, lesson, router]);

  if (isLoading || !lesson) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <p>Đang tải bài học...</p>
      </div>
    );
  }

  const kanjis = lesson.kanjis || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Link href="/kanji-lessons" className="shrink-0">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
              {lesson.title}
            </h1>
            <p className="text-muted-foreground mt-1 text-slate-500 truncate">
              {lesson.description}
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link
            href={`/kanji-lessons/${lesson.id}/edit`}
            className="flex-1 sm:flex-none"
          >
            <Button
              variant="outline"
              className="w-full gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
              Chỉnh sửa
            </Button>
          </Link>
          <Link
            href={`/kanji-lessons/${lesson.id}/study`}
            className="flex-1 sm:flex-none"
          >
            <Button className="w-full bg-purple-900 hover:bg-purple-800 text-white gap-2 cursor-pointer">
              <Presentation className="w-4 h-4" />
              Flashcard
            </Button>
          </Link>
          <Link
            href={`/kanji-lessons/${lesson.id}/quiz`}
            className="flex-1 sm:flex-none"
          >
            <Button
              variant="outline"
              className="w-full gap-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950/50 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              Quiz
            </Button>
          </Link>
        </div>
      </div>

      {/* Kanji List */}
      {kanjis.length === 0 ? (
        <div className="text-center py-20 bg-slate-100 rounded-xl border border-dashed border-slate-300 dark:bg-slate-900 dark:border-slate-800">
          <p className="text-slate-500">Bài học này chưa có chữ Hán nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {kanjis.map((kanji, index) => (
            <div
              key={kanji.id || index}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md hover:border-purple-200 dark:hover:border-purple-900 transition-all duration-300"
            >
              {/* Top section: large kanji character */}
              <div className="bg-gradient-to-br from-purple-50 to-slate-50 dark:from-purple-950/30 dark:to-slate-900 p-8 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                <div className="text-[120px] leading-none font-bold text-slate-800 dark:text-slate-100 select-none tracking-tighter">
                  {kanji.character}
                </div>
              </div>

              {/* Bottom section: info */}
              <div className="p-5 space-y-4">
                {/* Hán Việt + Meaning */}
                <div>
                  {kanji.hanViet && (
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-400 tracking-wide mb-1">
                      {kanji.hanViet}
                    </div>
                  )}
                  <div className="text-slate-700 dark:text-slate-300 font-medium text-base">
                    {kanji.meaning}
                  </div>
                </div>

                {/* On/Kun readings */}
                <div className="flex flex-wrap gap-3">
                  {kanji.onYomi && (
                    <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-lg px-3 py-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mr-1">
                        On
                      </span>
                      <span className="text-sm font-bold text-orange-800 dark:text-orange-300">
                        {kanji.onYomi}
                      </span>
                    </div>
                  )}
                  {kanji.kunYomi && (
                    <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg px-3 py-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mr-1">
                        Kun
                      </span>
                      <span className="text-sm font-bold text-green-800 dark:text-green-300">
                        {kanji.kunYomi}
                      </span>
                    </div>
                  )}
                </div>

                {/* Examples */}
                {kanji.examples && kanji.examples.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Từ vựng liên quan
                    </div>
                    <div className="space-y-1.5">
                      {kanji.examples.map((ex, exIdx) => (
                        <div
                          key={`ex-${exIdx}`}
                          className="flex gap-3 text-sm bg-blue-50 dark:bg-slate-800/80 p-2.5 rounded-lg"
                        >
                          <span className="font-bold text-blue-900 dark:text-blue-100 min-w-20">
                            {ex.word}
                          </span>
                          {ex.reading && (
                            <span className="text-slate-500 dark:text-slate-400">
                              [{ex.reading}]
                            </span>
                          )}
                          <span className="text-slate-600 dark:text-slate-300">
                            {ex.meaning}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related vocab from lesson */}
                {lesson.vocabularies?.filter((v) =>
                  v.japanese.includes(kanji.character)
                ).length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Từ vựng trong bài có chữ này
                    </div>
                    <div className="space-y-1.5">
                      {lesson.vocabularies
                        .filter((v) => v.japanese.includes(kanji.character))
                        .map((vocab, vIndex) => (
                          <div
                            key={`rel-${vIndex}`}
                            className="flex gap-3 text-sm bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg"
                          >
                            <span className="font-bold text-slate-800 dark:text-slate-200 min-w-20">
                              {vocab.japanese}
                            </span>
                            {vocab.hanViet && (
                              <span className="text-purple-600 dark:text-purple-400">
                                {vocab.hanViet}
                              </span>
                            )}
                            <span className="text-slate-500 dark:text-slate-400">
                              {vocab.vietnamese}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
