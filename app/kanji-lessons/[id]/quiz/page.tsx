'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';
import { Kanji } from '@/types';

// Each question: show kanji character, answer with meaning + onYomi + kunYomi
interface KanjiQuestion {
  kanji: Kanji;
  correctAnswerIndex: number;
  options: Array<{
    meaning: string;
    onYomi: string;
    kunYomi: string;
    hanViet: string;
  }>;
}

function buildOptions(kanjis: Kanji[], correctKanji: Kanji) {
  const others = kanjis.filter((k) => k.id !== correctKanji.id);
  const shuffled = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);

  const correctOption = {
    meaning: correctKanji.meaning,
    onYomi: correctKanji.onYomi || '',
    kunYomi: correctKanji.kunYomi || '',
    hanViet: correctKanji.hanViet || '',
  };
  const distractors = shuffled.map((k) => ({
    meaning: k.meaning,
    onYomi: k.onYomi || '',
    kunYomi: k.kunYomi || '',
    hanViet: k.hanViet || '',
  }));

  const allOptions = [correctOption, ...distractors].sort(() => 0.5 - Math.random());
  const correctAnswerIndex = allOptions.findIndex(
    (o) => o.meaning === correctOption.meaning && o.hanViet === correctOption.hanViet
  );

  return { options: allOptions, correctAnswerIndex };
}

export default function KanjiQuizPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { lessons, fetchLessons, fetchLessonById, isLoading } = useStore();
  const lesson = lessons.find((l) => l.id === id);
  const kanjis = useMemo(() => lesson?.kanjis || [], [lesson?.kanjis]);
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

  const [questions, setQuestions] = useState<KanjiQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (kanjis.length >= 2) {
      const generated: KanjiQuestion[] = kanjis.map((kanji) => {
        const { options, correctAnswerIndex } = buildOptions(kanjis, kanji);
        return { kanji, options, correctAnswerIndex };
      });
      setTimeout(() => {
        setQuestions(generated.sort(() => 0.5 - Math.random()));
      }, 0);
    }
  }, [kanjis]);

  const handleOptionClick = (optionIdx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIdx);
    if (optionIdx === questions[currentIndex].correctAnswerIndex) {
      setScore((prev) => prev + 1);
    }
    setTimeout(() => {
      setSelectedOption(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 1600);
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsFinished(false);
    setQuestions((prev) => [...prev].sort(() => 0.5 - Math.random()));
  };

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

  if (kanjis.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in">
        <h2 className="text-2xl font-bold text-slate-800">Cần ít nhất 2 chữ Hán</h2>
        <p className="text-slate-500">Hãy thêm thêm chữ Hán vào bài học để làm quiz.</p>
        <Button onClick={() => router.push(`/lessons/${lesson.id}/edit`)} variant="outline">
          Thêm chữ Hán
        </Button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-3 animate-in fade-in">
        <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Đang chuẩn bị câu hỏi...</p>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-xl mx-auto py-12 animate-in zoom-in-95 duration-500">
        <Card className="text-center shadow-xl border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              Hoàn thành Quiz!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-7xl font-black text-slate-800 dark:text-slate-100">
              {score}
              <span className="text-4xl text-slate-400"> / {questions.length}</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{percentage}%</div>
            <p className="text-lg text-slate-500">
              {percentage === 100
                ? 'Xuất sắc! Bạn thuộc tất cả chữ Hán! 🏆'
                : percentage >= 70
                ? 'Tốt lắm! Tiếp tục luyện tập nhé! 👍'
                : 'Cố lên! Ôn lại và thử lại! 💪'}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center pb-8">
            <Button
              onClick={restartQuiz}
              size="lg"
              className="gap-2 cursor-pointer bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
            >
              <RotateCcw className="w-5 h-5" />
              Làm lại
            </Button>
            <Link href="/kanji-lessons" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="gap-2 cursor-pointer w-full">
                <Home className="w-5 h-5" />
                Về trang Hán tự
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/kanji-lessons/${id}`}>
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <p className="text-slate-500 text-sm">Quiz Hán tự</p>
          </div>
        </div>
        <div className="text-sm font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-4 py-2 rounded-full">
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <Card className="shadow-lg border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Kanji display */}
        <div className="bg-gradient-to-br from-purple-50 to-slate-50 dark:from-purple-950/30 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 p-10 flex flex-col items-center justify-center min-h-[220px] gap-2">
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-2">
            Chữ Hán này có nghĩa là gì?
          </span>
          <div className="text-[110px] leading-none font-bold text-slate-800 dark:text-slate-100 select-none">
            {currentQ.kanji.character}
          </div>
        </div>

        {/* Options */}
        <CardContent className="p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((option, idx) => {
              const isCorrect = idx === currentQ.correctAnswerIndex;
              const isSelected = selectedOption === idx;

              let btnClass =
                'h-auto min-h-[90px] py-4 px-5 text-left border-2 transition-all cursor-pointer rounded-xl flex flex-col gap-1 ';

              if (selectedOption !== null) {
                if (isCorrect) {
                  btnClass += 'bg-green-100 border-green-500 dark:bg-green-900/40 dark:border-green-600';
                } else if (isSelected && !isCorrect) {
                  btnClass += 'bg-red-100 border-red-500 dark:bg-red-900/40 dark:border-red-600';
                } else {
                  btnClass += 'opacity-40 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950';
                }
              } else {
                btnClass +=
                  'bg-white dark:bg-slate-950 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800';
              }

              return (
                <button
                  key={idx}
                  className={btnClass}
                  onClick={() => handleOptionClick(idx)}
                  disabled={selectedOption !== null}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      {/* Meaning */}
                      <div className={`font-bold text-base ${isCorrect && selectedOption !== null ? 'text-green-800 dark:text-green-200' : isSelected && !isCorrect && selectedOption !== null ? 'text-red-800 dark:text-red-200' : 'text-slate-800 dark:text-slate-100'}`}>
                        {option.meaning}
                      </div>
                      {/* Hán Việt */}
                      {option.hanViet && (
                        <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                          {option.hanViet}
                        </div>
                      )}
                      {/* Readings row */}
                      <div className="flex gap-2 flex-wrap mt-1">
                        {option.onYomi && (
                          <span className="text-xs bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded px-1.5 py-0.5 font-semibold">
                            On: {option.onYomi}
                          </span>
                        )}
                        {option.kunYomi && (
                          <span className="text-xs bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 rounded px-1.5 py-0.5 font-semibold">
                            Kun: {option.kunYomi}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedOption !== null && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    )}
                    {selectedOption !== null && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
