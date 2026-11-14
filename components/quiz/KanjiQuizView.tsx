"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  Award,
} from "lucide-react";
import Link from "next/link";
import { Kanji } from "@/types";

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
    onYomi: correctKanji.onYomi || "",
    kunYomi: correctKanji.kunYomi || "",
    hanViet: correctKanji.hanViet || "",
  };
  const distractors = shuffled.map((k) => ({
    meaning: k.meaning,
    onYomi: k.onYomi || "",
    kunYomi: k.kunYomi || "",
    hanViet: k.hanViet || "",
  }));

  const allOptions = [correctOption, ...distractors].sort(
    () => 0.5 - Math.random()
  );
  const correctAnswerIndex = allOptions.findIndex(
    (o) =>
      o.meaning === correctOption.meaning && o.hanViet === correctOption.hanViet
  );

  return { options: allOptions, correctAnswerIndex };
}

interface KanjiQuizViewProps {
  kanjis: Kanji[];
  title?: string;
  subtitle?: string;
  backHref?: string;
  onRetake?: () => void;
}

export function KanjiQuizView({
  kanjis,
  title = "Bài kiểm tra Hán tự",
  subtitle = "Trắc nghiệm Hán tự",
  backHref = "/kanji-lessons",
  onRetake,
}: KanjiQuizViewProps) {
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
      setQuestions(generated.sort(() => 0.5 - Math.random()));
      setCurrentIndex(0);
      setScore(0);
      setSelectedOption(null);
      setIsFinished(false);
    }
  }, [kanjis]);

  const handleOptionClick = (optionIdx: number) => {
    if (selectedOption !== null || questions.length === 0) return;
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
    }, 1200);
  };

  const handleRestart = () => {
    if (onRetake) {
      onRetake();
    } else {
      setCurrentIndex(0);
      setScore(0);
      setSelectedOption(null);
      setIsFinished(false);
      setQuestions((prev) => [...prev].sort(() => 0.5 - Math.random()));
    }
  };

  if (kanjis.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Chưa đủ chữ Hán
        </h2>
        <p className="text-slate-500">
          Cần ít nhất 2 chữ Hán để tạo bài kiểm tra trắc nghiệm.
        </p>
        <Link href={backHref}>
          <Button variant="outline" className="cursor-pointer">
            Quay lại
          </Button>
        </Link>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">
          Đang chuẩn bị câu hỏi Hán tự...
        </p>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-xl mx-auto py-12 animate-in zoom-in-95 duration-500">
        <Card className="text-center shadow-xl border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="w-16 h-16 bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="w-8 h-8" />
            </div>
            <CardTitle className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              Hoàn thành bài test Hán tự!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-6xl font-black text-slate-800 dark:text-slate-100">
              {score} / {questions.length}
            </div>
            <div className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Đạt {percentage}%
            </div>
            <p className="text-lg text-slate-500">
              {score === questions.length
                ? "Thần đồng Hán tự! Điểm tuyệt đối! 🏆"
                : score >= questions.length / 2
                ? "Làm rất tốt! Bạn đã nhớ được rất nhiều chữ Hán. 👍"
                : "Tiếp tục cố gắng ôn tập nhé! 💪"}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center pb-8">
            <Button
              onClick={handleRestart}
              size="lg"
              className="gap-2 cursor-pointer bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto shadow-md"
            >
              <RotateCcw className="w-5 h-5" />
              Làm lại đề khác
            </Button>
            <Link href={backHref} className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 cursor-pointer w-full"
              >
                <Home className="w-5 h-5" />
                Về danh sách
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={backHref}>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-slate-500 text-sm">{subtitle}</p>
          </div>
        </div>
        <div className="text-sm font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-4 py-2 rounded-full">
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      <Card className="shadow-lg border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Kanji display */}
        <div className="bg-purple-50/50 dark:bg-purple-950/20 border-b border-slate-100 dark:border-slate-800 p-12 flex flex-col items-center justify-center min-h-[260px]">
          <div className="text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400 font-semibold mb-3">
            Chọn nghĩa và âm đọc của chữ Hán sau:
          </div>
          <div className="text-7xl md:text-8xl font-bold text-slate-800 dark:text-slate-100">
            {currentQ.kanji.character}
          </div>
        </div>

        {/* 4 Choices */}
        <CardContent className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((option, idx) => {
              const isCorrect = idx === currentQ.correctAnswerIndex;
              const isSelected = selectedOption === idx;

              let btnClass =
                "h-auto min-h-20 py-3.5 text-left font-medium justify-start px-5 border-2 transition-all cursor-pointer whitespace-normal flex-col items-start gap-1 ";

              if (selectedOption !== null) {
                if (isCorrect) {
                  btnClass +=
                    "bg-green-100 border-green-500 text-green-900 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300 dark:border-green-600";
                } else if (isSelected && !isCorrect) {
                  btnClass +=
                    "bg-red-100 border-red-500 text-red-900 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300 dark:border-red-600";
                } else {
                  btnClass +=
                    "opacity-50 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950";
                }
              } else {
                btnClass +=
                  "bg-white dark:bg-slate-950 hover:border-purple-400 hover:bg-purple-50/60 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800";
              }

              return (
                <Button
                  key={idx}
                  variant="outline"
                  className={btnClass}
                  onClick={() => handleOptionClick(idx)}
                  disabled={selectedOption !== null}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-base md:text-lg text-slate-800 dark:text-slate-100">
                      {option.hanViet || option.meaning}
                    </span>
                    {selectedOption !== null && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                    )}
                    {selectedOption !== null && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {option.meaning}
                  </div>
                  {(option.onYomi || option.kunYomi) && (
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
                      {option.onYomi && `Âm On: ${option.onYomi}`}
                      {option.onYomi && option.kunYomi && " · "}
                      {option.kunYomi && `Âm Kun: ${option.kunYomi}`}
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default KanjiQuizView;

