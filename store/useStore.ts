import { create } from "zustand";
import { Lesson, Vocabulary } from "@/types";
import { toast } from "sonner";

interface AppState {
  lessons: Lesson[];
  isLoading: boolean;
  error: string | null;
  fetchLessons: () => Promise<void>;
  addLesson: (lesson: Lesson) => Promise<void>;
  updateLesson: (
    id: string, 
    lesson: Partial<Omit<Lesson, "vocabularies">> & {
      vocabularies?: (Omit<Vocabulary, "id"> & { id?: string })[];
    }
  ) => Promise<void>;
  deleteLesson: (id: string) => Promise<void>;
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/lessons`;

export const useStore = create<AppState>((set, get) => ({
  lessons: [],
  isLoading: false,
  error: null,

  fetchLessons: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch lessons");
      const data = await response.json();
      set({ lessons: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error(error.message || "Failed to fetch lessons");
    }
  },

  addLesson: async (lesson) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: lesson.title,
          description: lesson.description,
          vocabularies: lesson.vocabularies.map((v) => ({
            japanese: v.japanese,
            vietnamese: v.vietnamese,
            hanViet: v.hanViet,
          })),
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create lesson");
      }
      const newLesson = await response.json();
      set((state) => ({ lessons: [...state.lessons, newLesson] }));
      toast.success("Lesson created successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create lesson");
      throw error;
    }
  },

  updateLesson: async (id, updatedFields) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update lesson");
      }
      const updatedLesson = await response.json();
      set((state) => ({
        lessons: state.lessons.map((lesson) =>
          lesson.id === id ? updatedLesson : lesson,
        ),
      }));
      toast.success("Lesson updated successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to update lesson");
      throw error;
    }
  },

  deleteLesson: async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete lesson");
      }
      set((state) => ({
        lessons: state.lessons.filter((lesson) => lesson.id !== id),
      }));
      toast.success("Lesson deleted successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to delete lesson");
    }
  },
}));
