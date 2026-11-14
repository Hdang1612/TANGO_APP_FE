"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  Send,
  Eye,
  EyeOff,
  SkipForward,
  Award,
} from "lucide-react";
import Link from "next/link";
import { Kanji } from "@/types";

interface Question {
  kanji: Kanji;
}

type QuestionStatus = "pending" | "correct" | "wrong" | "skipped";

interface HistoryRecord {
  index: number;
  status: QuestionStatus;
  userAnswer: string;
}

type FeedbackState = "idle" | "correct" | "wrong" | "skipped";

interface KanjiTypingQuizViewProps {
  kanjis: Kanji[];
  title?: string;
  subtitle?: string;
  backHref?: string;
  onRetake?: () => void;
}

// Remove Vietnamese accents for flexible typing check (e.g. "nhật" vs "nhat")
function removeAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export function KanjiTypingQuizView({
  kanjis,
  title = "Bài kiểm tra Hán tự",
  subtitle = "Gõ âm Hán Việt hoặc Nghĩa",
  backHref = "/kanji-lessons",
  onRetake,
}: KanjiTypingQuizViewProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>("idle");
  const [isFinished, setIsFinished] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [alreadyWrong, setAlreadyWrong] = useState(false);
  const TOTAL_COUNTDOWN_MS = 2500;
  const [isCountdownPaused, setIsCountdownPaused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const navScrollRef = useRef<HTMLDivElement>(null);
  const nextTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingAnswerRef = useRef<string>("");
  const remainingTimeRef = useRef<number>(TOTAL_COUNTDOWN_MS);
  const timerStartedAtRef = useRef<number | null>(null);
  const hoverCountRef = useRef<number>(0);

  const clearPendingTimer = useCallback(() => {
    if (nextTimerRef.current) {
      clearTimeout(nextTimerRef.current);
      nextTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (kanjis.length > 0) {
      const shuffled = [...kanjis].sort(() => 0.5 - Math.random());
      setQuestions(shuffled.map((kanji) => ({ kanji })));
      setCurrentIndex(0);
      setScore(0);
      setInputValue("");
      setFeedback("idle");
      setIsFinished(false);
      setShowAnswer(false);
      setHistory([]);
      setAlreadyWrong(false);
    }
  }, [kanjis]);

  useEffect(() => {
    if (!isAnimating) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [currentIndex, isAnimating]);

  useEffect(() => {
    const container = navScrollRef.current;
    if (!container) return;
    const btn = container.querySelector<HTMLElement>(
      `[data-nav-idx="${currentIndex}"]`
    );
    if (btn) {
      const cTop = container.scrollTop;
      const cHeight = container.clientHeight;
      const bTop = btn.offsetTop - container.offsetTop;
      const bHeight = btn.offsetHeight;

      if (bTop < cTop) {
        container.scrollTo({ top: Math.max(0, bTop - 4), behavior: "smooth" });
      } else if (bTop + bHeight > cTop + cHeight) {
        container.scrollTo({
          top: bTop + bHeight - cHeight + 4,
          behavior: "smooth",
        });
      }
    }
  }, [currentIndex]);

  const jumpToQuestion = useCallback(
    (targetIndex: number) => {
      if (isAnimating || targetIndex === currentIndex) return;
      clearPendingTimer();
      hoverCountRef.current = 0;
      setIsCountdownPaused(false);
      timerStartedAtRef.current = null;
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(targetIndex);
        setInputValue("");
        setFeedback("idle");
        setShowAnswer(false);
        setAlreadyWrong(false);
        setTimeout(() => {
          setIsAnimating(false);
          inputRef.current?.focus();
        }, 100);
      }, 150);
    },
    [isAnimating, currentIndex, clearPendingTimer]
  );

  const goToNext = useCallback(
    (finalStatus: QuestionStatus, finalAnswer: string) => {
      clearPendingTimer();
      hoverCountRef.current = 0;
      setIsCountdownPaused(false);
      timerStartedAtRef.current = null;

      setHistory((prev) => {
        const existing = prev.findIndex((h) => h.index === currentIndex);
        const record: HistoryRecord = {
          index: currentIndex,
          status: finalStatus,
          userAnswer: finalAnswer,
        };
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = record;
          return updated;
        }
        return [...prev, record];
      });

      setIsAnimating(true);
      setTimeout(() => {
        setInputValue("");
        setFeedback("idle");
        setShowAnswer(false);
        setAlreadyWrong(false);

        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setTimeout(() => {
            setIsAnimating(false);
            inputRef.current?.focus();
          }, 100);
        } else {
          setIsFinished(true);
          setIsAnimating(false);
        }
      }, 150);
    },
    [currentIndex, questions.length, clearPendingTimer]
  );

  const advanceNow = useCallback(() => {
    clearPendingTimer();
    hoverCountRef.current = 0;
    setIsCountdownPaused(false);
    timerStartedAtRef.current = null;
    goToNext("correct", pendingAnswerRef.current);
  }, [clearPendingTimer, goToNext]);

  const pauseCountdown = useCallback(() => {
    hoverCountRef.current += 1;
    if (feedback !== "correct") return;
    if (timerStartedAtRef.current) {
      const elapsed = Date.now() - timerStartedAtRef.current;
      remainingTimeRef.current = Math.max(500, remainingTimeRef.current - elapsed);
      timerStartedAtRef.current = null;
    }
    clearPendingTimer();
    setIsCountdownPaused(true);
  }, [feedback, clearPendingTimer]);

  const resumeCountdown = useCallback(() => {
    hoverCountRef.current = Math.max(0, hoverCountRef.current - 1);
    if (hoverCountRef.current > 0) return;
    if (feedback !== "correct") return;
    setIsCountdownPaused(false);
    timerStartedAtRef.current = Date.now();
    clearPendingTimer();
    nextTimerRef.current = setTimeout(() => {
      advanceNow();
    }, remainingTimeRef.current);
  }, [feedback, clearPendingTimer, advanceNow]);

  const handleSubmit = useCallback(() => {
    if (feedback === "correct" || feedback === "skipped" || isAnimating) return;
    if (!inputValue.trim()) return;

    const currentQ = questions[currentIndex];
    const userRaw = inputValue.trim().toLowerCase();
    const userNorm = removeAccents(userRaw);

    const hanVietNorm = removeAccents(currentQ.kanji.hanViet || "");
    const meaningNorm = removeAccents(currentQ.kanji.meaning || "");
    const onYomi = (currentQ.kanji.onYomi || "").toLowerCase();
    const kunYomi = (currentQ.kanji.kunYomi || "").toLowerCase();

    // Check if user answer matches Han-Viet, meaning, or readings
    const isCorrect =
      (hanVietNorm && (hanVietNorm.includes(userNorm) || userNorm.includes(hanVietNorm))) ||
      (meaningNorm && (meaningNorm.includes(userNorm) || userNorm.includes(meaningNorm))) ||
      (onYomi && onYomi.includes(userRaw)) ||
      (kunYomi && kunYomi.includes(userRaw));

    if (isCorrect) {
      setFeedback("correct");
      pendingAnswerRef.current = inputValue.trim();
      if (!alreadyWrong) setScore((prev) => prev + 1);

      clearPendingTimer();
      hoverCountRef.current = 0;
      setIsCountdownPaused(false);
      remainingTimeRef.current = TOTAL_COUNTDOWN_MS;
      timerStartedAtRef.current = Date.now();
      nextTimerRef.current = setTimeout(() => {
        advanceNow();
      }, TOTAL_COUNTDOWN_MS);
    } else {
      setFeedback("wrong");
      setAlreadyWrong(true);
    }
  }, [
    feedback,
    isAnimating,
    inputValue,
    questions,
    currentIndex,
    alreadyWrong,
    clearPendingTimer,
    advanceNow,
  ]);

  const handleSkip = useCallback(() => {
    if (isAnimating) return;
    clearPendingTimer();
    setFeedback("skipped");
    goToNext("skipped", inputValue.trim());
  }, [isAnimating, clearPendingTimer, goToNext, inputValue]);

  const handleRestart = () => {
    clearPendingTimer();
    if (onRetake) {
      onRetake();
    } else {
      setCurrentIndex(0);
      setScore(0);
      setInputValue("");
      setFeedback("idle");
      setIsFinished(false);
      setShowAnswer(false);
      setHistory([]);
      setAlreadyWrong(false);
      setQuestions((prev) => [...prev].sort(() => 0.5 - Math.random()));
    }
  };

  if (kanjis.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Chưa có chữ Hán
        </h2>
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
          Đang chuẩn bị bài test Hán tự...
        </p>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-xl mx-auto py-12 animate-in zoom-in-95 duration-500">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center p-8 space-y-6">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-2">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            Hoàn thành bài test Hán tự!
          </h2>
          <div className="text-6xl font-black text-slate-800 dark:text-slate-100">
            {score} / {questions.length}
          </div>
          <div className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Chính xác {percentage}%
          </div>

          <div className="grid grid-cols-3 gap-3 text-center py-2">
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-3">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {score}
              </div>
              <div className="text-xs text-green-700 dark:text-green-400 mt-0.5">
                Đúng
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {history.filter((h) => h.status === "wrong").length}
              </div>
              <div className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                Sai
              </div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3">
              <div className="text-2xl font-bold text-slate-600 dark:text-slate-300">
                {history.filter((h) => h.status === "skipped").length}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Bỏ qua</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Button
              onClick={handleRestart}
              size="lg"
              className="gap-2 cursor-pointer bg-purple-600 hover:bg-purple-700 text-white shadow-md"
            >
              <RotateCcw className="w-5 h-5" />
              Làm lại đề khác
            </Button>
            <Link href={backHref}>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 cursor-pointer w-full"
              >
                <Home className="w-5 h-5" />
                Về danh sách
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
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
        <div className="flex items-center gap-2">
          <div className="text-sm font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-4 py-2 rounded-full">
            {currentIndex + 1} / {questions.length}
          </div>
          <div className="text-sm font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-2 rounded-full hidden sm:block">
            {score} điểm
          </div>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
        {/* Kanji display */}
        <div className="bg-purple-50/40 dark:bg-purple-950/20 p-10 md:p-14 text-center border-b border-slate-100 dark:border-slate-800">
          <div className="text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400 font-semibold mb-3">
            Nhập âm Hán Việt hoặc Nghĩa tiếng Việt của chữ sau:
          </div>
          <div className="text-7xl md:text-8xl font-black text-slate-800 dark:text-slate-100">
            {currentQ.kanji.character}
          </div>
        </div>

        {/* Input & Feedback Section */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (feedback === "correct") {
                    advanceNow();
                  } else {
                    handleSubmit();
                  }
                }
              }}
              disabled={feedback === "correct"}
              placeholder="Gõ âm Hán Việt (vd: NHẬT) hoặc nghĩa tiếng Việt..."
              className={`flex-1 px-4 py-3 text-lg md:text-xl rounded-xl border-2 transition-all outline-none font-medium ${
                feedback === "correct"
                  ? "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300"
                  : feedback === "wrong"
                  ? "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-800 dark:text-red-300"
                  : "border-slate-300 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-slate-900"
              }`}
            />
            {feedback === "correct" ? (
              <Button
                onClick={advanceNow}
                className="bg-green-600 hover:bg-green-700 text-white px-6 rounded-xl cursor-pointer"
              >
                Tiếp tục
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 rounded-xl cursor-pointer"
              >
                <Send className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Feedback Banner */}
          {feedback === "correct" && (
            <div
              onMouseEnter={pauseCountdown}
              onMouseLeave={resumeCountdown}
              className="p-4 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0" />
                <div>
                  <div className="font-bold text-green-800 dark:text-green-300">
                    Chính xác!
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-400">
                    Hán Việt:{" "}
                    <span className="font-bold">{currentQ.kanji.hanViet}</span> —
                    Nghĩa: {currentQ.kanji.meaning}
                  </div>
                </div>
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                {isCountdownPaused ? "Đã tạm dừng" : "Tự chuyển sau 2s..."}
              </div>
            </div>
          )}

          {feedback === "wrong" && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0" />
                <div>
                  <div className="font-bold text-red-800 dark:text-red-300">
                    Chưa chính xác!
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-400">
                    Hãy thử lại hoặc nhấn "Xem đáp án".
                  </div>
                </div>
              </div>
            </div>
          )}

          {showAnswer && (
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-1">
              <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                Thông tin chữ Hán:
              </div>
              <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
                {currentQ.kanji.hanViet} — {currentQ.kanji.meaning}
              </div>
              {(currentQ.kanji.onYomi || currentQ.kanji.kunYomi) && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {currentQ.kanji.onYomi && `On: ${currentQ.kanji.onYomi}`}
                  {currentQ.kanji.onYomi && currentQ.kanji.kunYomi && " | "}
                  {currentQ.kanji.kunYomi && `Kun: ${currentQ.kanji.kunYomi}`}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAnswer(!showAnswer)}
              className="gap-1.5 text-slate-500 hover:text-slate-800 cursor-pointer text-xs"
            >
              {showAnswer ? (
                <>
                  <EyeOff className="w-4 h-4" /> Ẩn đáp án
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" /> Xem đáp án
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkip}
              className="gap-1.5 text-slate-500 hover:text-slate-800 cursor-pointer text-xs"
            >
              <SkipForward className="w-4 h-4" /> Bỏ qua
            </Button>
          </div>
        </div>
      </div>

      {/* Nav Strip for Question Jumping */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="text-xs font-semibold text-slate-500 mb-2.5">
          Danh sách câu hỏi:
        </div>
        <div
          ref={navScrollRef}
          className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1"
        >
          {questions.map((q, idx) => {
            const h = history.find((item) => item.index === idx);
            const isCurrent = idx === currentIndex;

            let badgeStyle =
              "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300";
            if (h?.status === "correct") {
              badgeStyle =
                "bg-green-100 text-green-700 border-green-300 dark:bg-green-950/60 dark:text-green-300";
            } else if (h?.status === "wrong") {
              badgeStyle =
                "bg-red-100 text-red-700 border-red-300 dark:bg-red-950/60 dark:text-red-300";
            } else if (h?.status === "skipped") {
              badgeStyle =
                "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300";
            }

            return (
              <button
                key={idx}
                data-nav-idx={idx}
                onClick={() => jumpToQuestion(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all cursor-pointer ${badgeStyle} ${
                  isCurrent
                    ? "ring-2 ring-purple-500 font-extrabold scale-105"
                    : "opacity-85 hover:opacity-100"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default KanjiTypingQuizView;

