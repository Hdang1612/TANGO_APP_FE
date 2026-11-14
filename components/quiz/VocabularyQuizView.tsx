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
import { Vocabulary } from "@/types";

interface Question {
  word: Vocabulary;
  type: "ja-to-vi" | "vi-to-ja";
  correctAnswer: string;
  options: string[];
}

interface VocabularyQuizViewProps {
  words: Vocabulary[];
  title?: string;
  subtitle?: string;
  backHref?: string;
  onRetake?: () => void;
}

export function VocabularyQuizView({
  words,
  title = "Bài kiểm tra Từ vựng",
  subtitle = "Trắc nghiệm nhiều lựa chọn",
  backHref = "/",
  onRetake,
}: VocabularyQuizViewProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (words.length >= 2) {
      const generatedQuestions = words.map((word) => {
        const type: "ja-to-vi" | "vi-to-ja" =
          Math.random() > 0.5 ? "ja-to-vi" : "vi-to-ja";
        const otherWords = words.filter((w) => w.id !== word.id);
        const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());

        let distractors: string[];
        let correctAnswer: string;
        if (type === "ja-to-vi") {
          distractors = shuffledOthers.slice(0, 3).map((w) => w.vietnamese);
          correctAnswer = word.vietnamese;
        } else {
          distractors = shuffledOthers.slice(0, 3).map((w) => w.japanese);
          correctAnswer = word.japanese;
        }

        const options = [correctAnswer, ...distractors].sort(
          () => 0.5 - Math.random()
        );
        return { word, type, correctAnswer, options };
      });
      setQuestions(generatedQuestions.sort(() => 0.5 - Math.random()));
      setCurrentIndex(0);
      setScore(0);
      setSelectedOption(null);
      setIsFinished(false);
    }
  }, [words]);

  const handleOptionClick = (option: string) => {
    if (selectedOption !== null || questions.length === 0) return;
    setSelectedOption(option);
    const isCorrect = option === questions[currentIndex].correctAnswer;
    if (isCorrect) setScore((prev) => prev + 1);

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

  if (words.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Chưa đủ từ vựng
        </h2>
        <p className="text-slate-500">
          Cần ít nhất 2 từ vựng để tạo bài kiểm tra trắc nghiệm.
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
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">
          Đang chuẩn bị câu hỏi...
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
            <div className="w-16 h-16 bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="w-8 h-8" />
            </div>
            <CardTitle className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              Hoàn thành bài test!
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
                ? "Xuất sắc! Điểm số tuyệt đối! 🏆"
                : score >= questions.length / 2
                ? "Làm tốt lắm! Hãy tiếp tục rèn luyện nhé. 👍"
                : "Cố gắng lên nhé! Lần tới bạn sẽ làm tốt hơn. 💪"}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center pb-8">
            <Button
              onClick={handleRestart}
              size="lg"
              className="gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto shadow-md"
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
        <div className="text-sm font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-4 py-2 rounded-full">
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      <Card className="shadow-lg border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-10 md:p-12 flex flex-col items-center justify-center min-h-[220px]">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
            {currentQ.type === "ja-to-vi"
              ? "Chọn nghĩa tiếng Việt của từ sau:"
              : "Chọn từ tiếng Nhật tương ứng:"}
          </div>
          <div
            className={`font-bold text-slate-800 dark:text-slate-100 text-center ${
              currentQ.type === "ja-to-vi"
                ? "text-5xl md:text-6xl"
                : "text-3xl md:text-4xl"
            }`}
          >
            {currentQ.type === "ja-to-vi"
              ? currentQ.word.japanese
              : currentQ.word.vietnamese}
          </div>
          {currentQ.type === "ja-to-vi" && currentQ.word.hanViet && (
            <div className="text-sm text-slate-400 mt-2">
              (Hán Việt: {currentQ.word.hanViet})
            </div>
          )}
        </div>
        <CardContent className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((option, idx) => {
              const isCorrect = option === currentQ.correctAnswer;
              const isSelected = selectedOption === option;

              let btnClass =
                "h-auto min-h-16 py-4 text-base md:text-lg font-medium justify-start px-6 border-2 transition-all cursor-pointer whitespace-normal text-left ";

              if (selectedOption !== null) {
                if (isCorrect) {
                  btnClass +=
                    "bg-green-100 border-green-500 text-green-800 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300 dark:border-green-600";
                } else if (isSelected && !isCorrect) {
                  btnClass +=
                    "bg-red-100 border-red-500 text-red-800 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300 dark:border-red-600";
                } else {
                  btnClass +=
                    "opacity-50 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950";
                }
              } else {
                btnClass +=
                  "bg-white dark:bg-slate-950 hover:border-blue-400 hover:bg-blue-50/60 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800";
              }

              return (
                <Button
                  key={idx}
                  variant="outline"
                  className={btnClass}
                  onClick={() => handleOptionClick(option)}
                  disabled={selectedOption !== null}
                >
                  <div className="flex items-center justify-between w-full gap-3">
                    <span className="text-left whitespace-normal break-words flex-1 leading-relaxed">
                      {option}
                    </span>
                    {selectedOption !== null && isCorrect && (
                      <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0" />
                    )}
                    {selectedOption !== null && isSelected && !isCorrect && (
                      <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0" />
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default VocabularyQuizView;

