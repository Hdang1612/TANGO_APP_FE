import { create } from "zustand";
import { Grammar, GrammarGroup, PaginationMeta, PaginatedResponse } from "@/types";
import { toast } from "sonner";
import axios from "axios";
import { api } from "@/lib/api";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

export interface FetchGrammarsParams {
  page?: number;
  limit?: number;
  groupId?: string;
}

interface GrammarState {
  grammars: Grammar[];
  grammarGroups: GrammarGroup[];
  grammarPagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;

  // Groups
  fetchGrammarGroups: () => Promise<void>;
  createGrammarGroup: (data: { name: string; description?: string }) => Promise<GrammarGroup>;
  updateGrammarGroup: (id: string, data: { name?: string; description?: string }) => Promise<void>;
  deleteGrammarGroup: (id: string) => Promise<void>;

  // Grammars
  fetchGrammars: (params?: FetchGrammarsParams) => Promise<PaginatedResponse<Grammar> | Grammar[]>;
  createGrammar: (data: Omit<Grammar, "id" | "createdAt" | "updatedAt" | "group">) => Promise<Grammar>;
  updateGrammar: (id: string, data: Partial<Omit<Grammar, "id" | "createdAt" | "updatedAt" | "group">>) => Promise<void>;
  deleteGrammar: (id: string) => Promise<void>;
}

export const useGrammarStore = create<GrammarState>((set) => ({
  grammars: [],
  grammarGroups: [],
  grammarPagination: null,
  isLoading: false,
  error: null,

  // ─── Groups ───────────────────────────────────────────────────────────────

  fetchGrammarGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const [groupsRes, grammarsRes] = await Promise.all([
        api.get<GrammarGroup[] | PaginatedResponse<GrammarGroup>>("/grammar-groups"),
        api.get<Grammar[] | PaginatedResponse<Grammar>>("/grammars"),
      ]);

      const groups = Array.isArray(groupsRes.data)
        ? groupsRes.data
        : (groupsRes.data as PaginatedResponse<GrammarGroup>).data;

      const grammars = Array.isArray(grammarsRes.data)
        ? grammarsRes.data
        : (grammarsRes.data as PaginatedResponse<Grammar>).data;

      set({
        grammarGroups: groups,
        grammars: grammars,
        grammarPagination: !Array.isArray(grammarsRes.data)
          ? {
              page: grammarsRes.data.page,
              limit: grammarsRes.data.limit,
              total: grammarsRes.data.total,
              totalPages: grammarsRes.data.totalPages,
            }
          : {
              page: 1,
              limit: grammars.length,
              total: grammars.length,
              totalPages: 1,
            },
        isLoading: false,
      });
    } catch (error) {
      const msg = getErrorMessage(error, "Không thể tải ngữ pháp");
      set({ error: msg, isLoading: false });
      toast.error(msg);
    }
  },

  createGrammarGroup: async (data) => {
    try {
      const res = await api.post<GrammarGroup>("/grammar-groups", data);
      const group = res.data;
      set((state) => ({
        grammarGroups: [...state.grammarGroups, { ...group, grammars: [] }],
      }));
      toast.success("Đã tạo nhóm ngữ pháp!");
      return group;
    } catch (error) {
      toast.error(getErrorMessage(error, "Tạo nhóm thất bại"));
      throw error;
    }
  },

  updateGrammarGroup: async (id, data) => {
    try {
      const res = await api.patch<GrammarGroup>(`/grammar-groups/${id}`, data);
      const updated = res.data;
      set((state) => ({
        grammarGroups: state.grammarGroups.map((g) =>
          g.id === id ? { ...g, ...updated } : g
        ),
      }));
      toast.success("Đã cập nhật nhóm ngữ pháp!");
    } catch (error) {
      toast.error(getErrorMessage(error, "Cập nhật nhóm thất bại"));
      throw error;
    }
  },

  deleteGrammarGroup: async (id) => {
    try {
      await api.delete(`/grammar-groups/${id}`);
      set((state) => ({
        grammarGroups: state.grammarGroups.filter((g) => g.id !== id),
        grammars: state.grammars.map((gr) =>
          gr.groupId === id ? { ...gr, groupId: undefined, group: undefined } : gr
        ),
      }));
      toast.success("Đã xóa nhóm ngữ pháp!");
    } catch (error) {
      toast.error(getErrorMessage(error, "Xóa nhóm thất bại"));
      throw error;
    }
  },

  // ─── Grammars ─────────────────────────────────────────────────────────────

  fetchGrammars: async (params?: FetchGrammarsParams) => {
    try {
      const res = await api.get<PaginatedResponse<Grammar> | Grammar[]>("/grammars", {
        params,
      });
      const data = res.data;
      if (Array.isArray(data)) {
        set({
          grammars: data,
          grammarPagination: {
            page: 1,
            limit: data.length,
            total: data.length,
            totalPages: 1,
          },
        });
        return data;
      } else {
        set({
          grammars: data.data,
          grammarPagination: {
            page: data.page,
            limit: data.limit,
            total: data.total,
            totalPages: data.totalPages,
          },
        });
        return data;
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải danh sách ngữ pháp"));
      throw error;
    }
  },

  createGrammar: async (data) => {
    try {
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
    } catch (error) {
      toast.error(getErrorMessage(error, "Thêm ngữ pháp thất bại"));
      throw error;
    }
  },

  updateGrammar: async (id, data) => {
    try {
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
    } catch (error) {
      toast.error(getErrorMessage(error, "Cập nhật ngữ pháp thất bại"));
      throw error;
    }
  },

  deleteGrammar: async (id) => {
    try {
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
    } catch (error) {
      toast.error(getErrorMessage(error, "Xóa ngữ pháp thất bại"));
      throw error;
    }
  },
}));
