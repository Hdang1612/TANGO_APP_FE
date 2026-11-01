'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGrammarStore } from '@/store/useGrammarStore';
import { Grammar, GrammarGroup } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  PlusCircle,
  Loader2,
  BookMarked,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Tag,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Grammar Card ─────────────────────────────────────────────────────────────

function GrammarCard({
  grammar,
  onDelete,
}: {
  grammar: Grammar;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const examples =
    (grammar.examples as { japanese: string; vietnamese?: string }[]) || [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-green-300 dark:hover:border-green-800 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div
        className="p-4 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2.5 py-0.5 rounded-full border border-green-200 dark:border-green-900">
                {grammar.name}
              </span>
              {grammar.group && (
                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  {grammar.group.name}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2">
              {grammar.usage}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Link
              href={`/grammar/${grammar.id}/edit`}
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40 cursor-pointer"
                title="Chỉnh sửa ngữ pháp"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(grammar.id);
              }}
              title="Xóa ngữ pháp"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <div className="p-1 text-slate-400">
              {expanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 pb-4 pt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {grammar.structure && (
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Cấu trúc / Cách chia
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg px-3 py-2 font-mono text-sm text-amber-800 dark:text-amber-300 whitespace-pre-wrap">
                {grammar.structure}
              </div>
            </div>
          )}

          {examples.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Ví dụ sử dụng ({examples.length})
              </div>
              <div className="space-y-2">
                {examples.map((ex, i) => (
                  <div
                    key={i}
                    className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-2.5 text-sm border border-slate-100 dark:border-slate-800"
                  >
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {ex.japanese}
                    </div>
                    {ex.vietnamese && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {ex.vietnamese}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Group Form Dialog ────────────────────────────────────────────────────────

function GroupFormDialog({
  open,
  onClose,
  editGroup,
}: {
  open: boolean;
  onClose: () => void;
  editGroup: GrammarGroup | null;
}) {
  const { createGrammarGroup, updateGrammarGroup } = useGrammarStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editGroup) {
      setName(editGroup.name);
      setDescription(editGroup.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [editGroup, open]);

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error('Vui lòng nhập tên nhóm');
    setSaving(true);
    try {
      if (editGroup) {
        await updateGrammarGroup(editGroup.id, {
          name: name.trim(),
          description: description.trim() || undefined,
        });
      } else {
        await createGrammarGroup({
          name: name.trim(),
          description: description.trim() || undefined,
        });
      }
      onClose();
    } catch {
      // error handled in store
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editGroup ? 'Chỉnh sửa nhóm ngữ pháp' : 'Tạo nhóm ngữ pháp mới'}
          </DialogTitle>
          <DialogDescription>
            Phân loại các mẫu ngữ pháp có cùng tính chất hoặc chủ đề liên quan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="groupName">
              Tên nhóm <span className="text-red-500">*</span>
            </Label>
            <Input
              id="groupName"
              placeholder="vd: Mẫu câu giả định, Nguyên nhân - Lý do..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="groupDesc">Mô tả (Tùy chọn)</Label>
            <Input
              id="groupDesc"
              placeholder="vd: Các cấu trúc biểu thị nếu, giả sử trong tiếng Nhật"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white gap-2 cursor-pointer"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editGroup ? 'Lưu thay đổi' : 'Tạo nhóm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GrammarTab() {
  const {
    grammars,
    grammarGroups,
    isLoading,
    fetchGrammarGroups,
    deleteGrammar,
    deleteGrammarGroup,
  } = useGrammarStore();

  const [view, setView] = useState<'all' | 'grouped'>('grouped');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<GrammarGroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'grammar' | 'group';
    id: string;
  } | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchGrammarGroups();
  }, [fetchGrammarGroups]);

  const toggleGroup = (id: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'grammar') {
        await deleteGrammar(deleteTarget.id);
      } else {
        await deleteGrammarGroup(deleteTarget.id);
      }
    } catch {
      // handled
    } finally {
      setDeleteTarget(null);
    }
  };

  // Filtered grammars for "all" view
  const filteredGrammars =
    filterGroup === 'all'
      ? grammars
      : filterGroup === 'none'
      ? grammars.filter((g) => !g.groupId)
      : grammars.filter((g) => g.groupId === filterGroup);

  // Ungrouped grammars
  const ungroupedGrammars = grammars.filter((g) => !g.groupId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ngữ pháp</h1>
          <p className="text-slate-500 mt-1">
            Quản lý các mẫu ngữ pháp tiếng Nhật theo nhóm chủ đề.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => {
              setEditGroup(null);
              setGroupDialogOpen(true);
            }}
            className="gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 dark:border-green-900 dark:text-green-400 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            Tạo nhóm
          </Button>
          <Link href="/grammar/create">
            <Button className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-lg hover:shadow-green-600/25 transition-all cursor-pointer">
              <PlusCircle className="w-5 h-5" />
              Thêm ngữ pháp
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-green-500" />
          <p>Đang tải ngữ pháp...</p>
        </div>
      ) : grammars.length === 0 && grammarGroups.length === 0 ? (
        /* Empty state */
        <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300 dark:bg-slate-900 dark:border-slate-800">
          <BookMarked className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
            Chưa có ngữ pháp nào
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
            Hãy tạo nhóm ngữ pháp và thêm các mẫu câu để bắt đầu học.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setEditGroup(null);
                setGroupDialogOpen(true);
              }}
              className="gap-2 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              Tạo nhóm
            </Button>
            <Link href="/grammar/create">
              <Button className="bg-green-600 hover:bg-green-700 text-white gap-2 cursor-pointer">
                <PlusCircle className="w-4 h-4" />
                Thêm ngữ pháp
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Controls: view switch and filter */}
          <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setView('grouped')}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all cursor-pointer ${
                  view === 'grouped'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Theo nhóm
                </span>
              </button>
              <button
                onClick={() => setView('all')}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all cursor-pointer ${
                  view === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Tất cả
                </span>
              </button>
            </div>

            {/* Filter by group (all view) */}
            {view === 'all' && grammarGroups.length > 0 && (
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
              >
                <option value="all">Tất cả nhóm ({grammars.length})</option>
                {grammarGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.grammars.length})
                  </option>
                ))}
                <option value="none">
                  Chưa phân nhóm ({ungroupedGrammars.length})
                </option>
              </select>
            )}

            <span className="text-sm text-slate-400">
              {grammars.length} ngữ pháp · {grammarGroups.length} nhóm
            </span>
          </div>

          {/* ── Grouped View ─────────────────────────────────────────────── */}
          {view === 'grouped' && (
            <div className="space-y-4">
              {grammarGroups.map((group) => {
                const collapsed = collapsedGroups.has(group.id);
                return (
                  <div
                    key={group.id}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900"
                  >
                    {/* Group Header */}
                    <div
                      className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 cursor-pointer select-none"
                      onClick={() => toggleGroup(group.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">
                          {collapsed ? (
                            <ChevronRight className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
                            {group.name}
                          </span>
                          {group.description && (
                            <span className="text-xs text-slate-400 ml-2 hidden sm:inline">
                              — {group.description}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full ml-1 font-medium">
                          {group.grammars.length}
                        </span>
                      </div>

                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40 cursor-pointer"
                          onClick={() => {
                            setEditGroup(group);
                            setGroupDialogOpen(true);
                          }}
                          title="Sửa nhóm"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                          onClick={() =>
                            setDeleteTarget({ type: 'group', id: group.id })
                          }
                          title="Xóa nhóm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Grammar cards */}
                    {!collapsed && (
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {group.grammars.length === 0 ? (
                          <div className="md:col-span-2 text-center py-8 text-slate-400 text-sm">
                            Nhóm này chưa có ngữ pháp nào.
                          </div>
                        ) : (
                          group.grammars.map((g) => (
                            <GrammarCard
                              key={g.id}
                              grammar={g}
                              onDelete={(id) =>
                                setDeleteTarget({ type: 'grammar', id })
                              }
                            />
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Ungrouped */}
              {ungroupedGrammars.length > 0 && (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/60">
                    <Tag className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      Chưa phân nhóm
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                      {ungroupedGrammars.length} mẫu
                    </span>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ungroupedGrammars.map((g) => (
                      <GrammarCard
                        key={g.id}
                        grammar={g}
                        onDelete={(id) =>
                          setDeleteTarget({ type: 'grammar', id })
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── All / Flat View ───────────────────────────────────────────── */}
          {view === 'all' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGrammars.length === 0 ? (
                <div className="md:col-span-2 text-center py-16 text-slate-400">
                  Không có ngữ pháp nào trong bộ lọc này.
                </div>
              ) : (
                filteredGrammars.map((g) => (
                  <GrammarCard
                    key={g.id}
                    grammar={g}
                    onDelete={(id) =>
                      setDeleteTarget({ type: 'grammar', id })
                    }
                  />
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* ── Dialogs ───────────────────────────────────────────────────────── */}
      <GroupFormDialog
        open={groupDialogOpen}
        onClose={() => {
          setGroupDialogOpen(false);
          setEditGroup(null);
        }}
        editGroup={editGroup}
      />

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open: boolean) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              {deleteTarget?.type === 'group'
                ? 'Xóa nhóm sẽ không xóa các ngữ pháp bên trong. Các ngữ pháp đó sẽ chuyển sang trạng thái chưa phân nhóm.'
                : 'Bạn có chắc muốn xóa ngữ pháp này không? Hành động này không thể hoàn tác.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setDeleteTarget(null)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export { GrammarTab };
