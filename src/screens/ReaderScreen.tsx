/**
 * Reader screen - displays EPUB content with chapter navigation
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBookStore } from '../store/bookStore';
import { getChapterContent } from '../services/bookService';
import { RootStackParamList, Chapter } from '../types';

type ReaderRouteProp = RouteProp<RootStackParamList, 'Reader'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Reader'>;

export default function ReaderScreen() {
  const route = useRoute<ReaderRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { bookId } = route.params;

  const { books, progress, updateProgress, setCurrentBook } = useBookStore();
  const book = books.find((b) => b.id === bookId);

  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  // Initialize from saved progress
  useEffect(() => {
    if (progress[bookId]) {
      setCurrentChapter(progress[bookId].currentChapterIndex);
    }
    setCurrentBook(bookId);
    return () => setCurrentBook(null);
  }, [bookId, progress, setCurrentBook]);

  // Load chapter content
  useEffect(() => {
    if (!book) return;

    const loadContent = async () => {
      setLoading(true);
      try {
        const text = await getChapterContent(book.filePath, currentChapter);
        setContent(text);
        
        // Update progress
        updateProgress(bookId, {
          bookId,
          currentChapterIndex: currentChapter,
          currentPage: currentChapter + 1,
          totalPages: book.chapters.length,
          percentage: ((currentChapter + 1) / book.chapters.length) * 100,
        });
      } catch (error) {
        console.error('Error loading chapter:', error);
        setContent('Error loading chapter content.');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [book, currentChapter, bookId, updateProgress]);

  const handlePrevChapter = useCallback(() => {
    if (currentChapter > 0) {
      setCurrentChapter((prev) => prev - 1);
    }
  }, [currentChapter]);

  const handleNextChapter = useCallback(() => {
    if (book && currentChapter < book.chapters.length - 1) {
      setCurrentChapter((prev) => prev + 1);
    }
  }, [currentChapter, book]);

  const handleChapterSelect = useCallback((index: number) => {
    setCurrentChapter(index);
    setShowToc(false);
  }, []);

  const handleAICompanion = useCallback(() => {
    navigation.navigate('AICompanion', { bookId });
  }, [navigation, bookId]);

  if (!book) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Book not found</Text>
      </View>
    );
  }

  const currentChapterData = book.chapters[currentChapter];
  const progressPercent = ((currentChapter + 1) / book.chapters.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowToc(true)} style={styles.titleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentChapterData?.title || `Chapter ${currentChapter + 1}`}
          </Text>
          <Text style={styles.headerSubtitle}>{book.title}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAICompanion} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>🤖</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e94560" />
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <Text style={[styles.chapterTitle, { fontSize: fontSize + 4 }]}>
            {currentChapterData?.title || `Chapter ${currentChapter + 1}`}
          </Text>
          <Text style={[styles.bodyText, { fontSize }]}>{content}</Text>
        </ScrollView>
      )}

      {/* Footer controls */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navBtn, currentChapter === 0 && styles.navBtnDisabled]}
          onPress={handlePrevChapter}
          disabled={currentChapter === 0}
        >
          <Text style={styles.navBtnText}>← Prev</Text>
        </TouchableOpacity>

        <View style={styles.fontControls}>
          <TouchableOpacity
            style={styles.fontBtn}
            onPress={() => setFontSize((s) => Math.max(12, s - 2))}
          >
            <Text style={styles.fontBtnText}>A-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fontBtn}
            onPress={() => setFontSize((s) => Math.min(24, s + 2))}
          >
            <Text style={styles.fontBtnText}>A+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.navBtn,
            currentChapter === book.chapters.length - 1 && styles.navBtnDisabled,
          ]}
          onPress={handleNextChapter}
          disabled={currentChapter === book.chapters.length - 1}
        >
          <Text style={styles.navBtnText}>Next →</Text>
        </TouchableOpacity>
      </View>

      {/* Table of Contents Modal */}
      <Modal visible={showToc} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.tocContainer}>
            <View style={styles.tocHeader}>
              <Text style={styles.tocTitle}>Chapters</Text>
              <TouchableOpacity onPress={() => setShowToc(false)}>
                <Text style={styles.tocClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={book.chapters}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }: { item: Chapter; index: number }) => (
                <TouchableOpacity
                  style={[
                    styles.tocItem,
                    index === currentChapter && styles.tocItemActive,
                  ]}
                  onPress={() => handleChapterSelect(index)}
                >
                  <Text
                    style={[
                      styles.tocItemText,
                      index === currentChapter && styles.tocItemTextActive,
                    ]}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a2e',
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBtnText: {
    fontSize: 20,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: '#8b8b8b',
    fontSize: 12,
  },
  progressContainer: {
    height: 3,
    backgroundColor: '#2d3561',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#e94560',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  chapterTitle: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  bodyText: {
    color: '#e0e0e0',
    lineHeight: 28,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a2e',
  },
  navBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#2d3561',
    borderRadius: 8,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  fontControls: {
    flexDirection: 'row',
    gap: 8,
  },
  fontBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#2d3561',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#16213e',
  },
  errorText: {
    color: '#e94560',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  tocContainer: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  tocHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2d3561',
  },
  tocTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  tocClose: {
    color: '#8b8b8b',
    fontSize: 20,
  },
  tocItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2d3561',
  },
  tocItemActive: {
    backgroundColor: '#2d3561',
  },
  tocItemText: {
    color: '#e0e0e0',
    fontSize: 15,
  },
  tocItemTextActive: {
    color: '#e94560',
    fontWeight: '600',
  },
});
