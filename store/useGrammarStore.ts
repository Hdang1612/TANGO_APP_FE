import { create } from "zustand";
import { Grammar, GrammarGroup } from "@/types";
import { toast } from "sonner";
import axios from "axios";
import { api } from "@/lib/api";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

interface GrammarState {
  grammars: Grammar[];
  grammarGroups: GrammarGroup[];
  isLoading: boolean;
  error: string | null;

  // Groups
  fetchGrammarGroups: () => Promise<void>;
  createGrammarGroup: (data: { name: string; description?: string }) => Promise<GrammarGroup>;
  updateGrammarGroup: (id: string, data: { name?: string; description?: string }) => Promise<void>;
  deleteGrammarGroup: (id: string) => Promise<void>;

  // Grammars
  fetchGrammars: () => Promise<void>;
  createGrammar: (data: Omit<Grammar, "id" | "createdAt" | "updatedAt" | "group">) => Promise<Grammar>;
  updateGrammar: (id: string, data: Partial<Omit<Grammar, "id" | "createdAt" | "updatedAt" | "group">>) => Promise<void>;
  deleteGrammar: (id: string) => Promise<void>;
}

export const useGrammarStore = create<GrammarState>((set, get) => ({
  grammars: [],
  grammarGroups: [],
  isLoading: false,
  error: null,

  // ─── Groups ───────────────────────────────────────────────────────────────

  fetchGrammarGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const [groupsRes, grammarsRes] = await Promise.all([
        api.get<GrammarGroup[]>("/grammar-groups", { skipLoading: true }),
        api.get<Grammar[]>("/grammars", { skipLoading: true }),
      ]);
      set({
        grammarGroups: groupsRes.data,
        grammars: grammarsRes.data,
        isLoading: false,
      });
    } catch (error) {
      const msg = getErrorMessage(error, "Không thể tải ngữ pháp");
      set({ error: msg, isLoading: false });
      toast.error(msg);
    }
  },

  createGrammarGroup: async (data) => {
    const res = await api.post<GrammarGroup>("/grammar-groups", data);
    const group = res.data;
    set((state) => ({
      grammarGroups: [...state.grammarGroups, { ...group, grammars: [] }],
    }));
    toast.success("Đã tạo nhóm ngữ pháp!");
    return group;
  },

  updateGrammarGroup: async (id, data) => {
    const res = await api.patch<GrammarGroup>(`/grammar-groups/${id}`, data);
    const updated = res.data;
    set((state) => ({
      grammarGroups: state.grammarGroups.map((g) =>
        g.id === id ? { ...g, ...updated } : g
      ),
    }));
    toast.success("Đã cập nhật nhóm ngữ pháp!");
  },

  deleteGrammarGroup: async (id) => {
    await api.delete(`/grammar-groups/${id}`);
    set((state) => ({
      grammarGroups: state.grammarGroups.filter((g) => g.id !== id),
      grammars: state.grammars.map((gr) =>
        gr.groupId === id ? { ...gr, groupId: undefined, group: undefined } : gr
      ),
    }));
    toast.success("Đã xóa nhóm ngữ pháp!");
  },

  // ─── Grammars ─────────────────────────────────────────────────────────────

  fetchGrammars: async () => {
    const res = await api.get<Grammar[]>("/grammars", { skipLoading: true });
    set({ grammars: res.data });
  },

  createGrammar: async (data) => {
    const res = await api.post<Grammar>("/grammars", data);
    const grammar = res.data;
    set((state) => {
      const newGrammars = [...state.grammars, grammar];
      const newGroups = state.grammarGroups.map((g) =>
        g.id === grammar.groupId
          ? { ...g, grammars: [...g.grammars, grammar] }
          : g
      );
      return { grammars: newGrammars, grammarGroups: newGroups };
    });
    toast.success("Đã thêm ngữ pháp mới!");
    return grammar;
  },

  updateGrammar: async (id, data) => {
    const res = await api.patch<Grammar>(`/grammars/${id}`, data);
    const updated = res.data;
    set((state) => {
      const newGrammars = state.grammars.map((g) => (g.id === id ? updated : g));
      const newGroups = state.grammarGroups.map((group) => ({
        ...group,
        grammars: group.grammars.map((g) => (g.id === id ? updated : g)),
      }));
      return { grammars: newGrammars, grammarGroups: newGroups };
    });
    toast.success("Đã cập nhật ngữ pháp!");
  },

  deleteGrammar: async (id) => {
    const grammar = get().grammars.find((g) => g.id === id);
    await api.delete(`/grammars/${id}`);
    set((state) => {
      const newGrammars = state.grammars.filter((g) => g.id !== id);
      const newGroups = state.grammarGroups.map((group) => ({
        ...group,
        grammars: group.grammars.filter((g) => g.id !== id),
      }));
      return { grammars: newGrammars, grammarGroups: newGroups };
    });
    toast.success("Đã xóa ngữ pháp!");
  },
}));
