"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Presentation, BookOpen, Layers } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Lesson } from "@/types";

export default function LessonOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { lessons, fetchLessons, isLoading } = useStore();
  const [lesson, setLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    if (lessons.length === 0) {
      fetchLessons();
    }
  }, [lessons.length, fetchLessons]);

  useEffect(() => {
    if (lessons.length > 0) {
      const found = lessons.find((l) => l.id === id);
      if (found) {
        setLesson(found);
      } else {
        router.push("/");
      }
    }
  }, [lessons, id, router]);

  if (isLoading || !lesson) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <p>Loading lesson...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Link href="/" className="shrink-0">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{lesson.title}</h1>
            <p className="text-muted-foreground mt-1 text-slate-500 truncate">
              {lesson.description}
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href={`/lessons/${lesson.id}/study`} className="flex-1 sm:flex-none">
            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white gap-2">
              <Presentation className="w-4 h-4" />
              Flashcards
            </Button>
          </Link>
          <Link href={`/lessons/${lesson.id}/quiz`} className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full gap-2">
              <BookOpen className="w-4 h-4" />
              Quiz
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
          <Layers className="w-5 h-5 text-blue-500" />
          Vocabulary List ({lesson.vocabularies?.length || 0} words)
        </div>
        
        {lesson.vocabularies?.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No vocabulary in this lesson yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">#</TableHead>
                <TableHead>Japanese</TableHead>
                <TableHead>Sino-Vietnamese</TableHead>
                <TableHead>Vietnamese</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lesson.vocabularies?.map((vocab, index) => (
                <TableRow key={vocab.id || index}>
                  <TableCell className="text-center font-medium text-slate-500">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-lg">
                    {vocab.japanese}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {vocab.hanViet || "-"}
                  </TableCell>
                  <TableCell>{vocab.vietnamese}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
