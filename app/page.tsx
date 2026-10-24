"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Layers,
  Edit2,
  Trash2,
  PlusCircle,
  Presentation,
  Loader2,
  Languages,
  BookMarked,
  Brush,
} from "lucide-react";

type Tab = "vocabulary" | "grammar" | "kanji";

export default function Home() {
  const router = useRouter();
  const { lessons, deleteLesson, fetchLessons, isLoading } = useStore();
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("vocabulary");

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const confirmDelete = () => {
    if (lessonToDelete) {
      deleteLesson(lessonToDelete);
      setLessonToDelete(null);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "vocabulary",
      label: "Từ vựng",
      icon: <Languages className="w-4 h-4" />,
    },
    {
      id: "grammar",
      label: "Ngữ pháp",
      icon: <BookMarked className="w-4 h-4" />,
    },
    {
      id: "kanji",
      label: "Hán tự",
      icon: <Brush className="w-4 h-4" />,
    },
  ];

  // Only show lessons that have vocabularies
  const vocabLessons = lessons.filter(
    (lesson) => lesson.vocabularies && lesson.vocabularies.length > 0
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="-mb-px flex gap-1" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "kanji") {
                  router.push("/kanji-lessons");
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-lg border-b-2 transition-all duration-200 cursor-pointer ${
                activeTab === tab.id && tab.id !== "kanji"
                  ? "border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Vocabulary Tab Content */}
      {activeTab === "vocabulary" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Từ vựng</h1>
              <p className="text-muted-foreground mt-1 text-slate-500">
                Quản lý danh sách từ vựng và bắt đầu học.
              </p>
            </div>
            <Link href="/lessons/create">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg hover:shadow-blue-600/25 transition-all">
                <PlusCircle className="w-5 h-5" />
                Tạo bài học mới
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
              <p>Đang tải bài học từ máy chủ...</p>
            </div>
          ) : vocabLessons.length === 0 ? (
            <div className="text-center py-20 bg-slate-100 rounded-xl border border-dashed border-slate-300 dark:bg-slate-900 dark:border-slate-800">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
                Chưa có bài học từ vựng nào
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Tạo bài học từ vựng đầu tiên để bắt đầu.
              </p>
              <Link href="/lessons/create">
                <Button variant="outline">Tạo bài học</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vocabLessons.map((lesson) => (
                <Card
                  key={lesson.id}
                  onClick={() => router.push(`/lessons/${lesson.id}`)}
                  className="group hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-blue-200 dark:border-slate-800 dark:hover:border-blue-900 bg-white dark:bg-slate-900 overflow-hidden cursor-pointer"
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl line-clamp-1">
                          {lesson.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-1 h-10">
                          {lesson.description}
                        </CardDescription>
                      </div>
                      <div
                        className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/lessons/${lesson.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLessonToDelete(lesson.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                      <Layers className="w-4 h-4 text-slate-400" />
                      {lesson.vocabularies?.length || 0}{" "}
                      {(lesson.vocabularies?.length || 0) === 1
                        ? "từ"
                        : "từ"}
                    </div>
                  </CardContent>
                  <CardFooter
                    className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href={`/lessons/${lesson.id}/study`}
                      className="flex-1"
                    >
                      <Button
                        variant="default"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white gap-2"
                      >
                        <Presentation className="w-4 h-4" />
                        Flashcard
                      </Button>
                    </Link>
                    <Link
                      href={`/lessons/${lesson.id}/quiz`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        className="w-full gap-2 border-slate-200 hover:bg-slate-50 hover:text-blue-700"
                      >
                        <BookOpen className="w-4 h-4" />
                        Quiz
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grammar Tab Content - placeholder */}
      {activeTab === "grammar" && (
        <div className="text-center py-20 bg-slate-100 rounded-xl border border-dashed border-slate-300 dark:bg-slate-900 dark:border-slate-800">
          <BookMarked className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
            Ngữ pháp
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Tính năng ngữ pháp sẽ được ra mắt sớm.
          </p>
        </div>
      )}

      <Dialog
        open={!!lessonToDelete}
        onOpenChange={(open) => !open && setLessonToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bạn có chắc chắn muốn xóa?</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác. Bài học và toàn bộ từ vựng sẽ
              bị xóa vĩnh viễn.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setLessonToDelete(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmDelete}
            >
              Xóa bài học
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
