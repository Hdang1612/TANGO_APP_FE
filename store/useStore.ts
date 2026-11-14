import { create } from "zustand";
import { Lesson, Vocabulary, Kanji, PaginationMeta, PaginatedResponse } from "@/types";
import { toast } from "sonner";
import axios from "axios";
import { api } from "@/lib/api";

export interface FetchLessonsParams {
  page?: number;
  limit?: number;
  type?: "vocabulary" | "kanji";
}

interface AppState {
  lessons: Lesson[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  fetchLessons: (params?: FetchLessonsParams) => Promise<PaginatedResponse<Lesson> | Lesson[]>;
  fetchLessonById: (id: string) => Promise<Lesson | null>;
  fetchTestVocabularies: (limit?: number) => Promise<Vocabulary[]>;
  fetchTestKanjis: (limit?: number) => Promise<Kanji[]>;
  addLesson: (lesson: Lesson) => Promise<void>;
  updateLesson: (
    id: string, 
    lesson: Partial<Omit<Lesson, "vocabularies" | "kanjis">> & {
      vocabularies?: (Omit<Vocabulary, "id"> & { id?: string })[];
      kanjis?: (Omit<Kanji, "id"> & { id?: string })[];
    }
  ) => Promise<void>;
  deleteLesson: (id: string) => Promise<void>;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

export const useStore = create<AppState>((set) => ({
  lessons: [],
  pagination: null,
  isLoading: false,
  error: null,

  fetchLessons: async (params?: FetchLessonsParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<PaginatedResponse<Lesson> | Lesson[]>("/lessons", {
        params,
        skipLoading: true,
      });
      const data = response.data;
      if (Array.isArray(data)) {
        set({
          lessons: data,
          pagination: {
            page: 1,
            limit: data.length,
            total: data.length,
            totalPages: 1,
          },
          isLoading: false,
        });
        return data;
      } else {
        set({
          lessons: data.data,
          pagination: {
            page: data.page,
            limit: data.limit,
            total: data.total,
            totalPages: data.totalPages,
          },
          isLoading: false,
        });
        return data;
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch lessons");
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  fetchLessonById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Lesson>(`/lessons/${id}`, { skipLoading: true });
      const data = response.data;
      set((state) => {
        const index = state.lessons.findIndex((l) => l.id === id);
        return {
          lessons: index >= 0
            ? state.lessons.map((l) => (l.id === id ? data : l))
            : [...state.lessons, data],
          isLoading: false,
        };
      });
      return data;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch lesson");
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  addLesson: async (lesson) => {
    try {
      const response = await api.post<Lesson>(
        "/lessons",
        {
          title: lesson.title,
          description: lesson.description,
          vocabularies: lesson.vocabularies?.map((v) => ({
            japanese: v.japanese,
            vietnamese: v.vietnamese,
            hanViet: v.hanViet,
          })) || [],
          kanjis: lesson.kanjis?.map((k) => ({
            character: k.character,
            meaning: k.meaning,
            hanViet: k.hanViet,
            onYomi: k.onYomi,
            kunYomi: k.kunYomi,
            examples: k.examples?.map(e => ({
              word: e.word,
              reading: e.reading,
              meaning: e.meaning
            })) || []
          })) || [],
        }
      );
      const newLesson = response.data;
      set((state) => ({ lessons: [...state.lessons, newLesson] }));
      toast.success("Lesson created successfully!");
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to create lesson");
      console.error(error);
      toast.error(errorMessage);
      throw error;
    }
  },

  updateLesson: async (id, updatedFields) => {
    try {
      const response = await api.put<Lesson>(
        `/lessons/${id}`,
        updatedFields
      );
      const updatedLesson = response.data;
      set((state) => ({
        lessons: state.lessons.map((lesson) =>
          lesson.id === id ? updatedLesson : lesson,
        ),
      }));
      toast.success("Lesson updated successfully!");
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to update lesson");
      console.error(error);
      toast.error(errorMessage);
      throw error;
    }
  },

  deleteLesson: async (id) => {
    try {
      await api.delete(`/lessons/${id}`);
      set((state) => ({
        lessons: state.lessons.filter((lesson) => lesson.id !== id),
      }));
      toast.success("Lesson deleted successfully!");
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to delete lesson");
      console.error(error);
      toast.error(errorMessage);
    }
  },

  fetchTestVocabularies: async (limit = 20) => {
    try {
      const response = await api.get<Vocabulary[]>("/lessons/test-vocabularies", {
        params: { limit },
        skipLoading: true,
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch test vocabularies");
      toast.error(errorMessage);
      throw error;
    }
  },

  fetchTestKanjis: async (limit = 20) => {
    try {
      const response = await api.get<Kanji[]>("/kanjis/test-kanjis", {
        params: { limit },
        skipLoading: true,
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch test kanjis");
      toast.error(errorMessage);
      throw error;
    }
  },
}));
