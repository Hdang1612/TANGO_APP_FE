'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface Question {
  word: { id: string; japanese: string; vietnamese: string };
  options: string[];
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const lesson = useStore((state) => state.lessons.find((l) => l.id === id));
  const words = lesson?.vocabularies || [];

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  // Generate quiz questions
  useEffect(() => {
    if (words.length > 0) {
      const generatedQuestions = words.map((word) => {
        // get up to 3 distractors
        const otherWords = words.filter(w => w.id !== word.id);
        const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
        const distractors = shuffledOthers.slice(0, 3).map(w => w.vietnamese);
        
        const options = [word.vietnamese, ...distractors].sort(() => 0.5 - Math.random());
        return { word, options };
      });
      // shuffle questions
      setQuestions(generatedQuestions.sort(() => 0.5 - Math.random()));
    }
  }, [words]);

  const handleOptionClick = (option: string) => {
    if (selectedOption !== null) return; // prevent multiple clicks
    
    setSelectedOption(option);
    
    const isCorrect = option === questions[currentIndex].word.vietnamese;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      setSelectedOption(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 1500);
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsFinished(false);
    // reshuffle
    setQuestions(prev => [...prev].sort(() => 0.5 - Math.random()));
  };

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in">
        <h2 className="text-2xl font-bold text-slate-800">Lesson not found</h2>
        <Button onClick={() => router.push('/')} variant="outline" className="cursor-pointer">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (words.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in">
        <h2 className="text-2xl font-bold text-slate-800">Not enough words</h2>
        <p className="text-slate-500">You need at least 2 words in a lesson to take a quiz.</p>
        <Button onClick={() => router.push(`/lessons/${lesson.id}/edit`)} variant="outline" className="cursor-pointer">
          Add Words
        </Button>
      </div>
    );
  }

  if (questions.length === 0) return null;

  if (isFinished) {
    return (
      <div className="max-w-xl mx-auto py-12 animate-in zoom-in-95 duration-500">
        <Card className="text-center shadow-xl border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-blue-600 dark:text-blue-400">Quiz Completed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-6xl font-black text-slate-800 dark:text-slate-100">
              {score} / {questions.length}
            </div>
            <p className="text-lg text-slate-500">
              {score === questions.length ? 'Perfect score! 🏆' : 
               score >= questions.length / 2 ? 'Great job! Keep practicing. 👍' : 
               'Keep trying! You will get it next time. 💪'}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center pb-8">
            <Button onClick={restartQuiz} size="lg" className="gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
              <RotateCcw className="w-5 h-5" />
              Retake Quiz
            </Button>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="gap-2 cursor-pointer w-full">
                <Home className="w-5 h-5" />
                Back to Home
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
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <p className="text-slate-500 text-sm">Multiple Choice Quiz</p>
          </div>
        </div>
        <div className="text-sm font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-4 py-2 rounded-full">
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      <Card className="shadow-lg border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-12 flex items-center justify-center min-h-[250px]">
          <div className="text-6xl md:text-7xl font-bold text-slate-800 dark:text-slate-100 text-center">
            {currentQ.word.japanese}
          </div>
        </div>
        <CardContent className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((option, idx) => {
              const isCorrect = option === currentQ.word.vietnamese;
              const isSelected = selectedOption === option;
              
              let btnClass = "h-16 text-lg font-medium justify-start px-6 border-2 transition-all cursor-pointer ";
              
              if (selectedOption !== null) {
                if (isCorrect) {
                  btnClass += "bg-green-100 border-green-500 text-green-800 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300 dark:border-green-600";
                } else if (isSelected && !isCorrect) {
                  btnClass += "bg-red-100 border-red-500 text-red-800 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300 dark:border-red-600";
                } else {
                  btnClass += "opacity-50 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950";
                }
              } else {
                btnClass += "bg-white dark:bg-slate-950 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800";
              }

              return (
                <Button
                  key={idx}
                  variant="outline"
                  className={btnClass}
                  onClick={() => handleOptionClick(option)}
                  disabled={selectedOption !== null}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{option}</span>
                    {selectedOption !== null && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />}
                    {selectedOption !== null && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
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
