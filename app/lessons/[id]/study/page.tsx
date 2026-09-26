'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import Link from 'next/link';

export default function StudyFlashcardsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const lesson = useStore((state) => state.lessons.find((l) => l.id === id));
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, lesson]);

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in">
        <h2 className="text-2xl font-bold text-slate-800">Lesson not found</h2>
        <Button onClick={() => router.push('/')} variant="outline">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const words = lesson.vocabularies;
  
  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in">
        <h2 className="text-2xl font-bold text-slate-800">No words in this lesson</h2>
        <Button onClick={() => router.push(`/lessons/${lesson.id}/edit`)} variant="outline">
          Add Words
        </Button>
      </div>
    );
  }

  const currentWord = words[currentIndex];

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 150); // slight delay for flip reset
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev - 1), 150);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <p className="text-slate-500 text-sm">Flashcard Study Mode</p>
          </div>
        </div>
        <div className="text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1.5 rounded-full">
          Card {currentIndex + 1} of {words.length}
        </div>
      </div>

      <div className="relative w-full h-[400px] [perspective:1000px]">
        <div 
          className={`w-full h-full relative transition-transform duration-700 [transform-style:preserve-3d] cursor-pointer shadow-xl rounded-2xl ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front Face (Japanese) */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-8 hover:border-blue-300 transition-colors">
            <span className="text-slate-400 text-sm font-medium tracking-widest uppercase mb-8">Japanese</span>
            <div className="text-6xl md:text-8xl font-bold text-slate-800 dark:text-slate-100 text-center">
              {currentWord.japanese}
            </div>
            <div className="absolute bottom-6 text-slate-400 flex items-center gap-2 text-sm">
              <RotateCw className="w-4 h-4" />
              Click or press Space to flip
            </div>
          </div>

          {/* Back Face (Vietnamese) */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-blue-50 dark:bg-slate-800 rounded-2xl border border-blue-200 dark:border-slate-700 flex flex-col items-center justify-center p-8">
            <span className="text-blue-400 dark:text-blue-300 text-sm font-medium tracking-widest uppercase mb-8">Vietnamese</span>
            <div className="text-4xl md:text-6xl font-bold text-blue-900 dark:text-blue-100 text-center">
              {currentWord.vietnamese}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <Button 
          variant="outline" 
          size="lg"
          className="gap-2 w-32"
          onClick={handlePrev} 
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </Button>
        
        {/* Progress Bar */}
        <div className="flex-1 mx-8 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          />
        </div>

        <Button 
          variant="default" 
          size="lg"
          className="gap-2 w-32 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleNext} 
          disabled={currentIndex === words.length - 1}
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
      <div className="text-center text-slate-400 text-sm mt-4">
        Pro tip: Use keyboard arrows ⬅️ ➡️ to navigate
      </div>
    </div>
  );
}
