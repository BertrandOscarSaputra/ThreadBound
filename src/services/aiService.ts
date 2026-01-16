/**
 * AI Service - Handles communication with Gemini API
 * with spoiler-safe context building
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  SYSTEM_PROMPT,
  SUMMARY_PROMPT,
  RECAP_PROMPT,
  CHARACTER_PROMPT,
  EXPLAIN_PROMPT,
} from '../prompts/systemPrompt';
import { getChapterContent } from './bookService';
import { Character } from '../types';

// Initialize Gemini - API key should be set via environment variable
// For development, you can set it directly (but never commit!)
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    if (!API_KEY) {
      throw new Error(
        'Gemini API key not configured. Set EXPO_PUBLIC_GEMINI_API_KEY in your environment.'
      );
    }
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
}

/**
 * Build spoiler-safe context by extracting content up to current chapter
 */
export async function buildSpoilerSafeContext(
  filePath: string,
  currentChapterIndex: number
): Promise<string> {
  const contentParts: string[] = [];

  // Get content from chapter 0 to current chapter (inclusive)
  for (let i = 0; i <= currentChapterIndex; i++) {
    const chapterContent = await getChapterContent(filePath, i);
    if (chapterContent) {
      contentParts.push(`--- Chapter ${i + 1} ---\n${chapterContent}`);
    }
  }

  const fullContext = contentParts.join('\n\n');

  // Truncate if too long (Gemini has token limits)
  const MAX_CONTEXT_CHARS = 30000;
  if (fullContext.length > MAX_CONTEXT_CHARS) {
    // Keep the most recent chapters if truncating
    return fullContext.slice(-MAX_CONTEXT_CHARS);
  }

  return fullContext;
}

/**
 * Send a message to Gemini with spoiler-safe context
 */
export async function sendToAI(
  message: string,
  bookContext: string,
  currentChapter: number
): Promise<string> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const contextInfo = `
[READER CONTEXT]
Current reading position: Chapter ${currentChapter + 1}
You must ONLY use information from the content below. Do not reference anything beyond this point.

[BOOK CONTENT UP TO CURRENT POSITION]
${bookContext}

[END OF AVAILABLE CONTENT]
`;

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [
            {
              text: 'I understand. I am a spoiler-free reading companion. I will only use information from the content you provide and never reference future events.',
            },
          ],
        },
      ],
    });

    const result = await chat.sendMessage(`${contextInfo}\n\n${message}`);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI Service Error:', error);
    throw new Error('Failed to get AI response. Please try again.');
  }
}

/**
 * Generate a summary of the story up to current position
 */
export async function generateSummary(
  filePath: string,
  currentChapter: number
): Promise<string> {
  const context = await buildSpoilerSafeContext(filePath, currentChapter);
  return sendToAI(SUMMARY_PROMPT, context, currentChapter);
}

/**
 * Generate a quick recap for returning readers
 */
export async function generateRecap(
  filePath: string,
  currentChapter: number
): Promise<string> {
  const context = await buildSpoilerSafeContext(filePath, currentChapter);
  return sendToAI(RECAP_PROMPT, context, currentChapter);
}

/**
 * Generate a spoiler-safe character guide
 */
export async function generateCharacterGuide(
  filePath: string,
  currentChapter: number
): Promise<string> {
  const context = await buildSpoilerSafeContext(filePath, currentChapter);
  const response = await sendToAI(CHARACTER_PROMPT, context, currentChapter);
  return response;
}

/**
 * Explain a specific passage or concept
 */
export async function explainPassage(
  passage: string,
  filePath: string,
  currentChapter: number
): Promise<string> {
  const context = await buildSpoilerSafeContext(filePath, currentChapter);
  const prompt = `${EXPLAIN_PROMPT}\n\nPassage the reader is asking about:\n"${passage}"`;
  return sendToAI(prompt, context, currentChapter);
}

/**
 * Handle a custom question from the reader
 */
export async function askQuestion(
  question: string,
  filePath: string,
  currentChapter: number
): Promise<string> {
  const context = await buildSpoilerSafeContext(filePath, currentChapter);
  return sendToAI(question, context, currentChapter);
}

/**
 * Check if AI service is configured
 */
export function isAIConfigured(): boolean {
  return !!API_KEY;
}
