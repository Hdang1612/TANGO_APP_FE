'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, CheckCircle2, XCircle, RotateCcw, Home,
  Send, Eye, EyeOff, SkipForward, RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

interface Question {
  word: { id: string; japanese: string; vietnamese: string; hanViet?: string };
}

type QuestionStatus = 'pending' | 'correct' | 'wrong' | 'skipped';

interface HistoryRecord {
  index: number;
  status: QuestionStatus;
  userAnswer: string;
}

type FeedbackState = 'idle' | 'correct' | 'wrong' | 'skipped';

export default function TypingQuizPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const lesson = useStore((state) => state.lessons.find((l) => l.id === id));
  const words = useMemo(() => lesson?.vocabularies || [], [lesson?.vocabularies]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState>('idle');
  const [isFinished, setIsFinished] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cardClass, setCardClass] = useState('tq-card-enter');
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [alreadyWrong, setAlreadyWrong] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const navScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (words.length > 0) {
      const shuffled = [...words].sort(() => 0.5 - Math.random());
      setQuestions(shuffled.map((word) => ({ word })));
    }
  }, [words]);

  useEffect(() => {
    if (!isAnimating) setTimeout(() => inputRef.current?.focus(), 80);
  }, [currentIndex, isAnimating]);

  // Auto-scroll the nav strip to keep current button visible without scrolling whole window
  useEffect(() => {
    const container = navScrollRef.current;
    if (!container) return;
    const btn = container.querySelector<HTMLElement>(`[data-nav-idx="${currentIndex}"]`);
    if (btn) {
      const cTop = container.scrollTop;
      const cHeight = container.clientHeight;
      const bTop = btn.offsetTop - container.offsetTop;
      const bHeight = btn.offsetHeight;

      if (bTop < cTop) {
        container.scrollTo({ top: Math.max(0, bTop - 4), behavior: 'smooth' });
      } else if (bTop + bHeight > cTop + cHeight) {
        container.scrollTo({ top: bTop + bHeight - cHeight + 4, behavior: 'smooth' });
      }
    }
  }, [currentIndex]);

  const jumpToQuestion = useCallback((targetIndex: number) => {
    if (isAnimating || targetIndex === currentIndex) return;
    setIsAnimating(true);
    setCardClass('tq-card-exit');
    setTimeout(() => {
      setCurrentIndex(targetIndex);
      setInputValue('');
      setFeedback('idle');
      setShowAnswer(false);
      setAlreadyWrong(false);
      setCardClass('tq-card-enter');
      setTimeout(() => {
        setIsAnimating(false);
        inputRef.current?.focus();
      }, 350);
    }, 320);
  }, [isAnimating, currentIndex]);

  const goToNext = useCallback((status: QuestionStatus, answer: string) => {
    setHistory((prev) => {
      const existing = prev.findIndex((r) => r.index === currentIndex);
      const record: HistoryRecord = { index: currentIndex, status, userAnswer: answer };
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = record;
        return next;
      }
      return [...prev, record];
    });

    setIsAnimating(true);
    setCardClass('tq-card-exit');

    setTimeout(() => {
      setInputValue('');
      setFeedback('idle');
      setShowAnswer(false);
      setAlreadyWrong(false);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setCardClass('tq-card-enter');
        setTimeout(() => {
          setIsAnimating(false);
          inputRef.current?.focus();
        }, 350);
      } else {
        setIsFinished(true);
        setIsAnimating(false);
      }
    }, 380);
  }, [currentIndex, questions.length]);

  const handleSubmit = useCallback(() => {
    if (feedback === 'correct' || feedback === 'skipped' || isAnimating) return;
    if (!inputValue.trim()) return;

    const currentQ = questions[currentIndex];
    const userInput = inputValue.trim().toLowerCase();
    const japaneseField = currentQ.word.japanese.toLowerCase();
    const isCorrect = japaneseField.includes(userInput) || userInput.includes(japaneseField);

    if (isCorrect) {
      setFeedback('correct');
      if (!alreadyWrong) setScore((prev) => prev + 1);
      setTimeout(() => goToNext('correct', inputValue.trim()), 1100);
    } else {
      setFeedback('wrong');
      setAlreadyWrong(true);
    }
  }, [feedback, isAnimating, inputValue, questions, currentIndex, alreadyWrong, goToNext]);

  const handleSkip = useCallback(() => {
    if (isAnimating || feedback === 'correct') return;
    setFeedback('skipped');
    setShowAnswer(true);
    setTimeout(() => goToNext('skipped', inputValue.trim()), 1800);
  }, [isAnimating, feedback, inputValue, goToNext]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (feedback === 'wrong') setFeedback('idle');
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setInputValue('');
    setFeedback('idle');
    setIsFinished(false);
    setShowAnswer(false);
    setIsAnimating(false);
    setCardClass('tq-card-enter');
    setHistory([]);
    setAlreadyWrong(false);
    setQuestions((prev) => [...prev].sort(() => 0.5 - Math.random()));
  };

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in">
        <h2 className="text-2xl font-bold text-slate-800">Lesson not found</h2>
        <Button onClick={() => router.push('/')} variant="outline">Back to Dashboard</Button>
      </div>
    );
  }

  if (words.length < 1) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in">
        <h2 className="text-2xl font-bold text-slate-800">Not enough words</h2>
        <Button onClick={() => router.push(`/lessons/${lesson.id}/edit`)} variant="outline">Thêm từ</Button>
      </div>
    );
  }

  if (questions.length === 0) return null;

  // ── Finished screen ──────────────────────────────────────────────────────
  if (isFinished) {
    const pct = Math.round((score / questions.length) * 100);
    const strokeDash = 2 * Math.PI * 40;
    const strokeOffset = strokeDash * (1 - pct / 100);
    const emoji = pct === 100 ? '🏆' : pct >= 70 ? '👍' : '💪';
    const wrongOrSkipped = history.filter((r) => r.status === 'wrong' || r.status === 'skipped');

    return (
      <>
        <style>{`
          @keyframes tq-ring-fill {
            from { stroke-dashoffset: ${strokeDash}px; }
            to   { stroke-dashoffset: ${strokeOffset}px; }
          }
          .tq-ring-animate { animation: tq-ring-fill 1.2s cubic-bezier(0.4,0,0.2,1) 0.3s both; }
        `}</style>
        <div className="max-w-xl mx-auto py-10 space-y-5 animate-in zoom-in-95 duration-500">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="p-8 text-center space-y-5">
              <div className="text-5xl">{emoji}</div>
              <h2 className="text-3xl font-bold text-purple-600 dark:text-purple-400">Typing Quiz Done!</h2>
              <div className="flex justify-center">
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                    <circle cx="50" cy="50" r="40" fill="none"
                      stroke={pct >= 70 ? '#22c55e' : '#f59e0b'}
                      strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${strokeDash}`} strokeDashoffset={`${strokeOffset}`}
                      className="tq-ring-animate"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{score}/{questions.length}</span>
                    <span className="text-sm text-slate-500">{pct}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 p-5 flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={restartQuiz} size="lg" className="gap-2 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer">
                <RotateCcw className="w-5 h-5" /> Làm lại từ đầu
              </Button>
              <Link href={`/lessons/${id}`}>
                <Button variant="outline" size="lg" className="gap-2 cursor-pointer w-full sm:w-auto">
                  <Home className="w-5 h-5" /> Quay lại bài
                </Button>
              </Link>
            </div>
          </div>

          {wrongOrSkipped.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                  Ôn lại — {wrongOrSkipped.length} câu sai / bỏ qua
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {wrongOrSkipped.map((rec) => {
                  const q = questions[rec.index];
                  return (
                    <div key={rec.index} className="flex items-center gap-3 px-5 py-3">
                      {rec.status === 'wrong'
                        ? <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                        : <SkipForward className="w-4 h-4 text-amber-500 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{q.word.vietnamese}</div>
                        <div className="text-xs text-slate-400">
                          Đáp án: <span className="font-semibold text-slate-600 dark:text-slate-300">{q.word.japanese}</span>
                          {rec.userAnswer && <span className="ml-2 text-red-400">bạn nhập: {rec.userAnswer}</span>}
                        </div>
                      </div>
                      <Button size="sm" variant="outline"
                        className="shrink-0 text-xs gap-1 cursor-pointer border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400"
                        onClick={() => { setIsFinished(false); jumpToQuestion(rec.index); }}
                      >
                        <RefreshCw className="w-3 h-3" /> Làm lại
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  // ── Quiz screen ──────────────────────────────────────────────────────────
  const currentQ = questions[currentIndex];
  const progress = (currentIndex / questions.length) * 100;
  const historyByIndex = Object.fromEntries(history.map((r) => [r.index, r]));

  const cardBorderClass =
    feedback === 'correct' ? 'border-green-400 dark:border-green-600'
    : feedback === 'wrong'  ? 'border-red-400 dark:border-red-600'
    : feedback === 'skipped'? 'border-amber-400 dark:border-amber-600'
    : 'border-slate-200 dark:border-slate-800';

  // Nav button style per status - strictly uniform dimensions, no scale transform
  const navBtnStyle = (idx: number): string => {
    const rec = historyByIndex[idx];
    const isCurrent = idx === currentIndex;
    const status: QuestionStatus = rec?.status ?? 'pending';

    if (isCurrent) {
      return 'bg-purple-600 text-white shadow-md ring-2 ring-purple-600 ring-offset-2 dark:ring-offset-slate-900 font-extrabold z-10';
    }
    if (status === 'correct') {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 cursor-default opacity-85';
    }
    if (status === 'wrong') {
      return 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 cursor-pointer shadow-2xs';
    }
    if (status === 'skipped') {
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 cursor-pointer shadow-2xs';
    }
    return 'bg-slate-50 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer';
  };

  return (
    <>
      <style>{`
        @keyframes tq-enter {
          from { opacity: 0; transform: translateX(60px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes tq-exit {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to   { opacity: 0; transform: translateX(-60px) scale(0.97); }
        }
        @keyframes tq-shake {
          0%,100% { transform: translateX(0); }
          18%  { transform: translateX(-10px); }
          36%  { transform: translateX(10px); }
          54%  { transform: translateX(-7px); }
          72%  { transform: translateX(7px); }
          88%  { transform: translateX(-3px); }
        }
        @keyframes tq-pop {
          0%   { transform: scale(1); }
          45%  { transform: scale(1.18); }
          70%  { transform: scale(0.94); }
          100% { transform: scale(1); }
        }
        .tq-card-enter { animation: tq-enter 0.38s cubic-bezier(0.22,1,0.36,1) both; }
        .tq-card-exit  { animation: tq-exit  0.32s cubic-bezier(0.6,0,1,0.4) both; }
        .tq-shake      { animation: tq-shake 0.48s ease-in-out; }
        .tq-pop        { animation: tq-pop 0.4s ease-out; }
        .quiz-nav-grid::-webkit-scrollbar { width: 4px; }
        .quiz-nav-grid::-webkit-scrollbar-track { background: transparent; }
        .quiz-nav-grid::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
        .dark .quiz-nav-grid::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>

      <div className="max-w-3xl mx-auto space-y-3.5">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/lessons/${id}`}>
              <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 cursor-pointer">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold leading-tight">{lesson.title}</h1>
              <p className="text-purple-500 text-xs mt-0.5 font-medium">✍️ Typing Quiz</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">✓ {score}</span>
            <span className="text-sm font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-3 py-1 rounded-full">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* ── Question preview & nav panel ── */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 shadow-xs space-y-2">
          {/* Header of preview list */}
          <div className="flex items-center justify-between gap-2 px-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Danh sách câu hỏi ({questions.length})
            </span>
            {/* Status Legend */}
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">Đúng</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span className="text-rose-600 dark:text-rose-400 font-medium">Sai</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                <span className="text-amber-600 dark:text-amber-400 font-medium">Bỏ qua</span>
              </span>
            </div>
          </div>

          {/* Question Grid: 8 (mobile) to 10 (sm+) questions per row */}
          <div
            ref={navScrollRef}
            className="quiz-nav-grid grid grid-cols-8 sm:grid-cols-10 gap-1.5 overflow-y-auto max-h-[82px] p-1 rounded-lg scroll-smooth"
          >
            {questions.map((_, idx) => {
              const rec = historyByIndex[idx];
              const isCurrent = idx === currentIndex;
              const status: QuestionStatus = rec?.status ?? 'pending';
              const isCorrect = status === 'correct';

              return (
                <button
                  key={idx}
                  data-nav-idx={idx}
                  disabled={isCorrect || isAnimating}
                  onClick={() => jumpToQuestion(idx)}
                  title={`Câu ${idx + 1}: ${questions[idx].word.vietnamese}${
                    status === 'correct' ? ' (Đã đúng)' : status === 'wrong' ? ' (Sai - Click làm lại)' : status === 'skipped' ? ' (Bỏ qua - Click làm lại)' : ''
                  }`}
                  className={`relative h-8 w-full rounded-lg text-xs font-bold leading-none flex items-center justify-center select-none transition-colors duration-150 ${navBtnStyle(idx)}`}
                >
                  <span>{idx + 1}</span>
                  {status === 'correct' && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-slate-900" />
                  )}
                  {status === 'wrong' && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-900" />
                  )}
                  {status === 'skipped' && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full border border-white dark:border-slate-900" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Question card ── */}
        <div>
          <div className="flex-1 min-w-0">
            <div
              key={currentIndex}
              className={`${cardClass} ${cardBorderClass} ${feedback === 'wrong' ? 'tq-shake' : ''} bg-white dark:bg-slate-900 rounded-2xl border-2 shadow-md overflow-hidden transition-[border-color] duration-300`}
            >
              {/* Prompt */}
              <div className="bg-gradient-to-br from-slate-50 to-purple-50/60 dark:from-slate-900 dark:to-purple-950/40 p-7 md:p-9 flex flex-col items-center justify-center min-h-[160px] gap-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold uppercase tracking-widest text-purple-500 dark:text-purple-400">
                  Nghĩa tiếng Việt → Nhập tiếng Nhật
                </p>
                <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 text-center leading-snug">
                  {currentQ.word.vietnamese}
                </div>
                {currentQ.word.hanViet && (
                  <div className="text-xs text-slate-400 italic">({currentQ.word.hanViet})</div>
                )}
                {showAnswer && (
                  <div className="mt-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-amber-800 dark:text-amber-300 text-xl font-bold animate-in fade-in zoom-in-95 duration-200">
                    {currentQ.word.japanese}
                  </div>
                )}
              </div>

              {/* Input area */}
              <div className="p-5 space-y-3">
                {feedback !== 'idle' && (
                  <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold animate-in fade-in duration-150 ${
                    feedback === 'correct'
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700'
                      : feedback === 'wrong'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
                      : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700'
                  }`}>
                    {feedback === 'correct'  && <><CheckCircle2 className="w-5 h-5 shrink-0 tq-pop" /><span>Chính xác！素晴らしい！</span></>}
                    {feedback === 'wrong'    && <><XCircle className="w-5 h-5 shrink-0" /><span>Chưa đúng — thử lại hoặc bỏ qua.</span></>}
                    {feedback === 'skipped'  && <><EyeOff className="w-5 h-5 shrink-0" /><span>Đáp án: <strong>{currentQ.word.japanese}</strong></span></>}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={feedback === 'correct' || feedback === 'skipped' || isAnimating}
                    placeholder="Nhập từ tiếng Nhật..."
                    className={`flex-1 px-4 py-3 text-base rounded-xl border-2 outline-none transition-all duration-200 bg-white dark:bg-slate-950 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 ${
                      feedback === 'correct' ? 'border-green-400 dark:border-green-600 bg-green-50/50 dark:bg-green-900/10'
                      : feedback === 'wrong'  ? 'border-red-400 dark:border-red-600'
                      : feedback === 'skipped'? 'border-amber-400 dark:border-amber-600'
                      : 'border-slate-200 dark:border-slate-700 focus:border-purple-400 dark:focus:border-purple-500'
                    }`}
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={!inputValue.trim() || feedback === 'correct' || feedback === 'skipped' || isAnimating}
                    className="px-4 h-auto py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shrink-0 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm"
                    onClick={() => setShowAnswer((v) => !v)}
                    disabled={feedback === 'correct' || isAnimating}
                    className="gap-1.5 text-slate-400 hover:text-slate-600 cursor-pointer text-xs h-7"
                  >
                    {showAnswer ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showAnswer ? 'Ẩn đáp án' : 'Xem đáp án'}
                  </Button>
                  <Button variant="ghost" size="sm"
                    onClick={handleSkip}
                    disabled={feedback === 'correct' || feedback === 'skipped' || isAnimating}
                    className="gap-1.5 text-slate-400 hover:text-slate-600 cursor-pointer text-xs h-7 ml-auto"
                  >
                    Bỏ qua →
                  </Button>
                </div>
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-600">
              Nhấn <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[10px]">Enter</kbd> để xác nhận · contain · nhập lại sau khi sai
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
