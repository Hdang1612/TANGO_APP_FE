'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookOpen, Layers, Edit2, Trash2, PlusCircle, Presentation } from 'lucide-react';

export default function Home() {
  const { lessons, deleteLesson } = useStore();
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);

  const confirmDelete = () => {
    if (lessonToDelete) {
      deleteLesson(lessonToDelete);
      setLessonToDelete(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Lessons</h1>
          <p className="text-muted-foreground mt-1 text-slate-500">
            Manage your vocabulary lists and start studying.
          </p>
        </div>
        <Link href="/lessons/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg hover:shadow-blue-600/25 transition-all">
            <PlusCircle className="w-5 h-5" />
            Create New Lesson
          </Button>
        </Link>
      </div>

      {lessons.length === 0 ? (
        <div className="text-center py-20 bg-slate-100 rounded-xl border border-dashed border-slate-300 dark:bg-slate-900 dark:border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No lessons yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Create your first vocabulary lesson to get started.</p>
          <Link href="/lessons/create">
            <Button variant="outline">Create Lesson</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="group hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-blue-200 dark:border-slate-800 dark:hover:border-blue-900 bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl line-clamp-1">{lesson.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1 h-10">
                      {lesson.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/lessons/${lesson.id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setLessonToDelete(lesson.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  <Layers className="w-4 h-4 text-slate-400" />
                  {lesson.vocabularies.length} {lesson.vocabularies.length === 1 ? 'word' : 'words'}
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <Link href={`/lessons/${lesson.id}/study`} className="flex-1">
                  <Button variant="default" className="w-full bg-slate-900 hover:bg-slate-800 text-white gap-2">
                    <Presentation className="w-4 h-4" />
                    Flashcards
                  </Button>
                </Link>
                <Link href={`/lessons/${lesson.id}/quiz`} className="flex-1">
                  <Button variant="outline" className="w-full gap-2 border-slate-200 hover:bg-slate-50 hover:text-blue-700">
                    <BookOpen className="w-4 h-4" />
                    Quiz
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!lessonToDelete} onOpenChange={(open) => !open && setLessonToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the lesson and remove its vocabulary from your device.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setLessonToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>
              Delete Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
