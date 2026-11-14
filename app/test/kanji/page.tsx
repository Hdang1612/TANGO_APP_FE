"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Kanji } from "@/types";
import { KanjiQuizView } from "@/components/quiz/KanjiQuizView";
import { KanjiTypingQuizView } from "@/components/quiz/KanjiTypingQuizView";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function KanjiTestContent() {
  const searchParams = useSearchParams();
  const sizeParam = searchParams.get("size");
  const modeParam = searchParams.get("mode");

  const size = Math.max(1, Math.min(100, Number(sizeParam) || 20));
  const mode = modeParam === "typing" ? "typing" : "quiz";

  const { fetchTestKanjis } = useStore();
  const [kanjis, setKanjis] = useState<Kanji[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTestKanjis(size);
      setKanjis(data);
    } catch {
      setError("Không thể tải ngân hàng chữ Hán để tạo bài kiểm tra.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchTestKanjis, size]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Đang tạo đề kiểm tra Hán tự...
          </h2>
          <p className="text-sm text-slate-500">
            Đang trích xuất ngẫu nhiên {size} chữ Hán từ ngân hàng dữ liệu
          </p>
        </div>
      </div>
    );
  }

  if (error || kanjis.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {error || "Chưa có đủ chữ Hán để tạo bài test"}
        </h2>
        <p className="text-slate-500 text-sm">
          Vui lòng thêm chữ Hán vào các bài học trước khi tiến hành làm bài test.
        </p>
        <div className="flex gap-3">
          <Button onClick={loadData} variant="outline" className="cursor-pointer">
            Thử lại
          </Button>
          <Link href="/kanji-lessons">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer">
              Về danh sách Hán tự
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (mode === "typing") {
    return (
      <KanjiTypingQuizView
        kanjis={kanjis}
        title="Bài test Hán tự"
        subtitle={`Kiểm tra ${kanjis.length} câu ngẫu nhiên · Chế độ nhập từ`}
        backHref="/kanji-lessons"
        onRetake={loadData}
      />
    );
  }

  return (
    <KanjiQuizView
      kanjis={kanjis}
      title="Bài test Hán tự"
      subtitle={`Kiểm tra ${kanjis.length} câu ngẫu nhiên · Trắc nghiệm`}
      backHref="/kanji-lessons"
      onRetake={loadData}
    />
  );
}

export default function KanjiTestPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-28 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-sm text-slate-500">Đang khởi tạo bài test...</p>
        </div>
      }
    >
      <KanjiTestContent />
    </Suspense>
  );
}

