/**
 * Core TypeScript types for ThreadBound
 */

// Book metadata and content
export interface Book {
  id: string;
  title: string;
  author: string;
  coverUri?: string;
  filePath: string;
  fileType: 'epub';
  chapters: Chapter[];
  addedAt: number;
  lastReadAt?: number;
}

export interface Chapter {
  id: string;
  title: string;
  index: number;
  content?: string;
}

// Reading progress tracking
export interface ReadingProgress {
  bookId: string;
  currentChapterIndex: number;
  currentPage: number;
  totalPages: number;
  percentage: number;
  lastUpdated: number;
}

// Character tracking for AI companion
export interface Character {
  name: string;
  role: string;
  traits: string[];
  relationships: string[];
  firstAppearanceChapter: number;
}

// AI conversation
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  type?: 'summary' | 'recap' | 'character' | 'explain' | 'chat';
}

// App navigation params
export type RootStackParamList = {
  Library: undefined;
  Reader: { bookId: string };
  AICompanion: { bookId: string };
};
