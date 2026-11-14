"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Vocabulary } from "@/types";
import { VocabularyQuizView } from "@/components/quiz/VocabularyQuizView";
import { VocabularyTypingQuizView } from "@/components/quiz/VocabularyTypingQuizView";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function VocabularyTestContent() {
  const searchParams = useSearchParams();
  const sizeParam = searchParams.get("size");
  const modeParam = searchParams.get("mode");

  const size = Math.max(1, Math.min(100, Number(sizeParam) || 20));
  const mode = modeParam === "typing" ? "typing" : "quiz";

  const { fetchTestVocabularies } = useStore();
  const [words, setWords] = useState<Vocabulary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTestVocabularies(size);
      setWords(data);
    } catch {
      setError("Không thể tải ngân hàng câu hỏi kiểm tra.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchTestVocabularies, size]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Đang tạo đề kiểm tra...
          </h2>
          <p className="text-sm text-slate-500">
            Đang trích xuất ngẫu nhiên {size} câu từ ngân hàng dữ liệu
          </p>
        </div>
      </div>
    );
  }

  if (error || words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {error || "Chưa có đủ từ vựng để tạo bài test"}
        </h2>
        <p className="text-slate-500 text-sm">
          Vui lòng thêm thêm từ vựng vào các bài học trước khi tiến hành làm bài test.
        </p>
        <div className="flex gap-3">
          <Button onClick={loadData} variant="outline" className="cursor-pointer">
            Thử lại
          </Button>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
              Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (mode === "typing") {
    return (
      <VocabularyTypingQuizView
        words={words}
        title="Bài test Từ vựng"
        subtitle={`Kiểm tra ${words.length} câu ngẫu nhiên · Chế độ nhập từ`}
        backHref="/"
        onRetake={loadData}
      />
    );
  }

  return (
    <VocabularyQuizView
      words={words}
      title="Bài test Từ vựng"
      subtitle={`Kiểm tra ${words.length} câu ngẫu nhiên · Trắc nghiệm`}
      backHref="/"
      onRetake={loadData}
    />
  );
}

export default function VocabularyTestPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-28 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-500">Đang khởi tạo bài test...</p>
        </div>
      }
    >
      <VocabularyTestContent />
    </Suspense>
  );
}

