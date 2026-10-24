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
  Layers,
  Loader2,
  PlusCircle,
  Presentation,
  BookOpen,
  Brush,
  Languages,
  BookMarked,
  Edit2,
  Trash2,
} from "lucide-react";

type Tab = "vocabulary" | "grammar" | "kanji";

export default function KanjiLessonsPage() {
  const router = useRouter();
  const { lessons, fetchLessons, deleteLesson, isLoading } = useStore();
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
  const activeTab: Tab = "kanji";

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const confirmDelete = () => {
    if (lessonToDelete) {
      deleteLesson(lessonToDelete);
      setLessonToDelete(null);
    }
  };

  // Only show lessons that have kanjis
  const kanjiLessons = lessons.filter(
    (lesson) => lesson.kanjis && lesson.kanjis.length > 0
  );

  const tabs: { id: Tab; label: string; icon: React.ReactNode; href?: string }[] = [
    {
      id: "vocabulary",
      label: "Từ vựng",
      icon: <Languages className="w-4 h-4" />,
      href: "/",
    },
    {
      id: "grammar",
      label: "Ngữ pháp",
      icon: <BookMarked className="w-4 h-4" />,
      href: "/",
    },
    {
      id: "kanji",
      label: "Hán tự",
      icon: <Brush className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="-mb-px flex gap-1" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.href) {
                  router.push(tab.href);
                }
              }}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-lg border-b-2 transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? "border-purple-600 text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hán tự</h1>
          <p className="text-muted-foreground mt-1 text-slate-500">
            Học chữ Hán, âm On, âm Kun, nghĩa Hán Việt và ví dụ từ vựng.
          </p>
        </div>
        <Link href="/kanji-lessons/create">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-lg hover:shadow-purple-600/25 transition-all cursor-pointer">
            <PlusCircle className="w-5 h-5" />
            Tạo bài học mới
          </Button>
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-purple-500" />
          <p>Đang tải bài học...</p>
        </div>
      ) : kanjiLessons.length === 0 ? (
        <div className="text-center py-20 bg-slate-100 rounded-xl border border-dashed border-slate-300 dark:bg-slate-900 dark:border-slate-800">
          <div className="text-6xl mx-auto mb-4 text-slate-300 dark:text-slate-700 font-bold">
            漢
          </div>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
            Chưa có bài học Hán tự nào
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Tạo bài học mới và thêm chữ Hán vào để bắt đầu.
          </p>
          <Link href="/kanji-lessons/create">
            <Button variant="outline" className="cursor-pointer">Tạo bài học Hán tự</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kanjiLessons.map((lesson) => (
            <Card
              key={lesson.id}
              onClick={() => router.push(`/kanji-lessons/${lesson.id}`)}
              className="group hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-purple-200 dark:border-slate-800 dark:hover:border-purple-900 bg-white dark:bg-slate-900 overflow-hidden cursor-pointer"
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="pr-2">
                    <CardTitle className="text-xl line-clamp-1">
                      {lesson.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-1 h-10">
                      {lesson.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div
                      className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link href={`/kanji-lessons/${lesson.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-purple-600 hover:bg-purple-50 cursor-pointer"
                          title="Chỉnh sửa bài học"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        title="Xóa bài học"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLessonToDelete(lesson.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* Preview kanji characters */}
                    <div className="flex gap-0.5 shrink-0">
                      {lesson.kanjis?.slice(0, 3).map((k) => (
                        <span
                          key={k.id}
                          className="text-2xl font-bold text-purple-600 dark:text-purple-400 leading-none"
                        >
                          {k.character}
                        </span>
                      ))}
                      {(lesson.kanjis?.length || 0) > 3 && (
                        <span className="text-sm text-slate-400 self-end mb-0.5">
                          ...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  <Layers className="w-4 h-4 text-purple-400" />
                  {lesson.kanjis?.length || 0} chữ Hán
                </div>
              </CardContent>
              <CardFooter
                className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  href={`/kanji-lessons/${lesson.id}/study`}
                  className="flex-1"
                >
                  <Button
                    variant="default"
                    className="w-full bg-purple-900 hover:bg-purple-800 text-white gap-2 cursor-pointer"
                  >
                    <Presentation className="w-4 h-4" />
                    Flashcard
                  </Button>
                </Link>
                <Link
                  href={`/kanji-lessons/${lesson.id}/quiz`}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-purple-200 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-900 cursor-pointer"
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

      <Dialog
        open={!!lessonToDelete}
        onOpenChange={(open) => !open && setLessonToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bạn có chắc chắn muốn xóa?</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác. Bài học và toàn bộ Hán tự sẽ
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
