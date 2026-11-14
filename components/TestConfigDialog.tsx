"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BookOpen, PenLine, Sparkles, Check } from "lucide-react";

interface TestConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "vocabulary" | "kanji";
}

const TEST_SIZES = [20, 40, 60, 100];

export default function TestConfigDialog({
  open,
  onOpenChange,
  type,
}: TestConfigDialogProps) {
  const router = useRouter();
  const [size, setSize] = useState<number>(20);
  const [mode, setMode] = useState<"quiz" | "typing">("quiz");

  const isVocab = type === "vocabulary";
  const title = isVocab ? "Bài test Từ vựng tổng hợp" : "Bài test Hán tự tổng hợp";
  const themeColor = isVocab
    ? "border-blue-600 bg-blue-50/70 text-blue-700 dark:bg-blue-950/40 dark:border-blue-500 dark:text-blue-300"
    : "border-purple-600 bg-purple-50/70 text-purple-700 dark:bg-purple-950/40 dark:border-purple-500 dark:text-purple-300";

  const btnBg = isVocab
    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
    : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20";

  const handleStart = () => {
    onOpenChange(false);
    router.push(`/test/${type}?size=${size}&mode=${mode}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-lg ${
                isVocab
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                  : "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-1.5 text-slate-500">
            Hệ thống sẽ lấy ngẫu nhiên các câu hỏi từ toàn bộ ngân hàng {isVocab ? "từ vựng" : "chữ Hán"} để tạo đề kiểm tra năng lực.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Question count selection */}
          <div className="space-y-2.5">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Kích thước bài test (Số lượng câu)
            </Label>
            <div className="grid grid-cols-4 gap-2.5">
              {TEST_SIZES.map((s) => {
                const isSelected = size === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`py-3 px-2 rounded-xl border-2 text-center transition-all cursor-pointer relative ${
                      isSelected
                        ? `${themeColor} font-bold shadow-sm ring-1 ${
                            isVocab ? "ring-blue-500/50" : "ring-purple-500/50"
                          }`
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="text-lg font-bold">{s}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">câu</div>
                    {isSelected && (
                      <div
                        className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white ${
                          isVocab ? "bg-blue-600" : "bg-purple-600"
                        }`}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Test mode selection */}
          <div className="space-y-2.5">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Hình thức kiểm tra
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Multiple Choice Quiz */}
              <button
                type="button"
                onClick={() => setMode("quiz")}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-start gap-3 relative ${
                  mode === "quiz"
                    ? `${themeColor} font-medium shadow-sm ring-1 ${
                        isVocab ? "ring-blue-500/50" : "ring-purple-500/50"
                      }`
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    mode === "quiz"
                      ? isVocab
                        ? "bg-blue-600 text-white"
                        : "bg-purple-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">Trắc nghiệm</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Chọn 1 đáp án đúng từ 4 phương án
                  </div>
                </div>
                {mode === "quiz" && (
                  <div
                    className={`absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center text-white ${
                      isVocab ? "bg-blue-600" : "bg-purple-600"
                    }`}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>

              {/* Typing / Text Input */}
              <button
                type="button"
                onClick={() => setMode("typing")}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-start gap-3 relative ${
                  mode === "typing"
                    ? `${themeColor} font-medium shadow-sm ring-1 ${
                        isVocab ? "ring-blue-500/50" : "ring-purple-500/50"
                      }`
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    mode === "typing"
                      ? isVocab
                        ? "bg-blue-600 text-white"
                        : "bg-purple-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <PenLine className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">Nhập từ</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Gõ câu trả lời trực tiếp từ bàn phím
                  </div>
                </div>
                {mode === "typing" && (
                  <div
                    className={`absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center text-white ${
                      isVocab ? "bg-blue-600" : "bg-purple-600"
                    }`}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            onClick={handleStart}
            className={`${btnBg} cursor-pointer shadow-md font-medium gap-1.5`}
          >
            Bắt đầu làm bài ({size} câu)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

