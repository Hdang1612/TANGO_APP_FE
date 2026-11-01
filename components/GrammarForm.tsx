'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Grammar, GrammarGroup } from '@/types';
import { useGrammarStore } from '@/store/useGrammarStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Save,
  PlusCircle,
  Trash2,
  Loader2,
  FolderPlus,
  BookMarked,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export interface GrammarFormValues {
  name: string;
  usage: string;
  structure?: string;
  examples: { japanese: string; vietnamese: string }[];
  groupId?: string;
}

interface GrammarFormProps {
  initialData?: Grammar | null;
  onSubmit: (data: GrammarFormValues) => Promise<void>;
  pageTitle: string;
  pageDescription: string;
  backHref?: string;
}

export function GrammarForm({
  initialData,
  onSubmit,
  pageTitle,
  pageDescription,
  backHref = '/?tab=grammar',
}: GrammarFormProps) {
  const router = useRouter();
  const { grammarGroups, createGrammarGroup } = useGrammarStore();

  const [name, setName] = useState(initialData?.name || '');
  const [usage, setUsage] = useState(initialData?.usage || '');
  const [structure, setStructure] = useState(initialData?.structure || '');
  const [groupId, setGroupId] = useState(initialData?.groupId || '');
  const [examples, setExamples] = useState<{ japanese: string; vietnamese: string }[]>(
    initialData?.examples && initialData.examples.length > 0
      ? (initialData.examples as { japanese: string; vietnamese?: string }[]).map((e) => ({
          japanese: e.japanese || '',
          vietnamese: e.vietnamese || '',
        }))
      : [{ japanese: '', vietnamese: '' }]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Add / Remove / Update examples
  const handleAddExample = () => {
    setExamples((prev) => [...prev, { japanese: '', vietnamese: '' }]);
  };

  const handleRemoveExample = (index: number) => {
    setExamples((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateExample = (
    index: number,
    field: 'japanese' | 'vietnamese',
    value: string
  ) => {
    setExamples((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Quick group creation
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error('Vui lòng nhập tên nhóm');
      return;
    }
    setCreatingGroup(true);
    try {
      const created = await createGrammarGroup({
        name: newGroupName.trim(),
        description: newGroupDesc.trim() || undefined,
      });
      setGroupId(created.id);
      setNewGroupName('');
      setNewGroupDesc('');
      setGroupModalOpen(false);
    } catch {
      // toast is already handled in store
    } finally {
      setCreatingGroup(false);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Vui lòng nhập tên ngữ pháp');
      return;
    }
    if (!usage.trim()) {
      toast.error('Vui lòng nhập cách sử dụng');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        usage: usage.trim(),
        structure: structure.trim() || undefined,
        groupId: groupId || undefined,
        examples: examples.filter((ex) => ex.japanese.trim() || ex.vietnamese.trim()),
      });
    } catch {
      // error handled in caller/store
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      {/* Top Header */}
      <div className="flex items-center gap-4">
        <Link href={backHref}>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
          <p className="text-slate-500">{pageDescription}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Thông tin ngữ pháp */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-green-600 dark:text-green-400" />
              <CardTitle className="text-xl">Thông tin ngữ pháp</CardTitle>
            </div>
            <CardDescription>
              Nhập tên mẫu câu, nhóm chủ đề, cách dùng và cấu trúc ngữ pháp.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tên ngữ pháp */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên ngữ pháp <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="vd: 〜たら, 〜ば, 〜ても, 〜わけにはいかない..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-base font-semibold"
                required
              />
            </div>

            {/* Nhóm ngữ pháp */}
            <div className="space-y-2">
              <Label htmlFor="groupId">Nhóm ngữ pháp (Chủ đề / Phân loại)</Label>
              <div className="flex gap-2">
                <select
                  id="groupId"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="flex-1 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                >
                  <option value="">-- Chưa phân nhóm --</option>
                  {grammarGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setGroupModalOpen(true)}
                  className="gap-1.5 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 dark:border-green-900 dark:text-green-400 cursor-pointer shrink-0"
                >
                  <FolderPlus className="w-4 h-4" />
                  Tạo nhóm mới
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Gợi ý: Gom các mẫu ngữ pháp có cùng ý nghĩa (ví dụ: nhóm &quot;Nếu/Giả định&quot;, nhóm &quot;Vì/Nguyên nhân&quot;...)
              </p>
            </div>

            {/* Cách sử dụng */}
            <div className="space-y-2">
              <Label htmlFor="usage">
                Ý nghĩa & Cách sử dụng <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="usage"
                rows={3}
                placeholder="vd: Dùng để diễn tả một điều kiện giả định, hoặc một hành động xảy ra sau khi một hành động khác kết thúc..."
                value={usage}
                onChange={(e) => setUsage(e.target.value)}
                className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
                required
              />
            </div>

            {/* Cấu trúc / Cách chia */}
            <div className="space-y-2">
              <Label htmlFor="structure">Cấu trúc / Cách chia</Label>
              <textarea
                id="structure"
                rows={2}
                placeholder="vd: V-た + ら&#10;A-い (-い) + かったら&#10;Na / N + だったら"
                value={structure}
                onChange={(e) => setStructure(e.target.value)}
                className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
              />
              <p className="text-xs text-slate-400">
                Gợi ý cách chia theo các dạng động từ, tính từ đuôi i, tính từ đuôi na, danh từ.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Danh sách câu ví dụ */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <CardTitle className="text-xl">Ví dụ sử dụng</CardTitle>
            </div>
            <CardDescription>
              Thêm các câu ví dụ mẫu kèm bản dịch tiếng Việt để dễ ôn tập và hiểu ngữ cảnh.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {examples.map((example, index) => (
              <div
                key={index}
                className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Ví dụ #{index + 1}
                  </span>
                  {examples.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveExample(index)}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 h-7 px-2 cursor-pointer"
                      title="Xóa ví dụ này"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Xóa
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Câu tiếng Nhật</Label>
                  <Input
                    placeholder="vd: 雨が降ったら、行きません。"
                    value={example.japanese}
                    onChange={(e) =>
                      handleUpdateExample(index, 'japanese', e.target.value)
                    }
                    className="bg-white dark:bg-slate-950 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Dịch nghĩa tiếng Việt</Label>
                  <Input
                    placeholder="vd: Nếu trời mưa thì tôi không đi."
                    value={example.vietnamese}
                    onChange={(e) =>
                      handleUpdateExample(index, 'vietnamese', e.target.value)
                    }
                    className="bg-white dark:bg-slate-950 text-sm"
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddExample}
              className="w-full border-dashed border-2 py-5 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30 gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Thêm câu ví dụ
            </Button>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
            <Link href={backHref}>
              <Button type="button" variant="outline" className="cursor-pointer">
                Hủy
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-lg hover:shadow-green-600/25 transition-all cursor-pointer min-w-[140px]"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {initialData ? 'Lưu thay đổi' : 'Tạo ngữ pháp'}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Quick Group Creation Modal */}
      <Dialog open={groupModalOpen} onOpenChange={setGroupModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo nhóm ngữ pháp mới</DialogTitle>
            <DialogDescription>
              Tạo nhóm để phân loại các mẫu ngữ pháp theo chủ đề liên quan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="newGroupName">
                Tên nhóm <span className="text-red-500">*</span>
              </Label>
              <Input
                id="newGroupName"
                placeholder="vd: Mẫu câu giả định, Nguyên nhân - Lý do..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newGroupDesc">Mô tả (Tùy chọn)</Label>
              <Input
                id="newGroupDesc"
                placeholder="vd: Các cách nói nếu, giả sử trong tiếng Nhật"
                value={newGroupDesc}
                onChange={(e) => setNewGroupDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setGroupModalOpen(false)}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleCreateGroup}
              disabled={creatingGroup}
              className="bg-green-600 hover:bg-green-700 text-white gap-2 cursor-pointer"
            >
              {creatingGroup && <Loader2 className="w-4 h-4 animate-spin" />}
              Tạo nhóm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
