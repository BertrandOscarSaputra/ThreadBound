/**
 * Global state management with Zustand
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book, ReadingProgress, AIMessage } from '../types';

interface BookState {
  // Book library
  books: Book[];
  addBook: (book: Book) => void;
  removeBook: (bookId: string) => void;
  
  // Reading progress
  progress: Record<string, ReadingProgress>;
  updateProgress: (bookId: string, progress: Partial<ReadingProgress>) => void;
  
  // Current reading session
  currentBookId: string | null;
  setCurrentBook: (bookId: string | null) => void;
  
  // AI conversation history per book
  aiHistory: Record<string, AIMessage[]>;
  addAIMessage: (bookId: string, message: AIMessage) => void;
  clearAIHistory: (bookId: string) => void;
}

export const useBookStore = create<BookState>()(
  persist(
    (set) => ({
      // Book library
      books: [],
      addBook: (book) =>
        set((state) => ({
          books: [...state.books, book],
        })),
      removeBook: (bookId) =>
        set((state) => ({
          books: state.books.filter((b) => b.id !== bookId),
        })),

      // Reading progress
      progress: {},
      updateProgress: (bookId, progressUpdate) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [bookId]: {
              ...state.progress[bookId],
              ...progressUpdate,
              lastUpdated: Date.now(),
            } as ReadingProgress,
          },
        })),

      // Current reading session
      currentBookId: null,
      setCurrentBook: (bookId) => set({ currentBookId: bookId }),

      // AI conversation history
      aiHistory: {},
      addAIMessage: (bookId, message) =>
        set((state) => ({
          aiHistory: {
            ...state.aiHistory,
            [bookId]: [...(state.aiHistory[bookId] || []), message],
          },
        })),
      clearAIHistory: (bookId) =>
        set((state) => ({
          aiHistory: {
            ...state.aiHistory,
            [bookId]: [],
          },
        })),
    }),
    {
      name: 'threadbound-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Atomic selectors for granular state access (reduces re-renders)
export const useBooks = () => useBookStore((s) => s.books);
export const useProgress = () => useBookStore((s) => s.progress);
export const useAIHistory = () => useBookStore((s) => s.aiHistory);
export const useCurrentBookId = () => useBookStore((s) => s.currentBookId);

// Action selectors (stable references, don't cause re-renders)
export const useBookActions = () =>
  useBookStore((s) => ({
    addBook: s.addBook,
    removeBook: s.removeBook,
  }));

export const useProgressActions = () =>
  useBookStore((s) => ({
    updateProgress: s.updateProgress,
    setCurrentBook: s.setCurrentBook,
  }));

export const useAIActions = () =>
  useBookStore((s) => ({
    addAIMessage: s.addAIMessage,
    clearAIHistory: s.clearAIHistory,
  }));
