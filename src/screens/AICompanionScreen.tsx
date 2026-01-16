/**
 * AI Companion Screen - Chat interface with reading assistant
 */
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useBookStore } from '../store/bookStore';
import {
  generateSummary,
  generateRecap,
  generateCharacterGuide,
  askQuestion,
  isAIConfigured,
} from '../services/aiService';
import QuickActions from '../components/QuickActions';
import { RootStackParamList, AIMessage } from '../types';

type AICompanionRouteProp = RouteProp<RootStackParamList, 'AICompanion'>;

export default function AICompanionScreen() {
  const route = useRoute<AICompanionRouteProp>();
  const navigation = useNavigation();
  const { bookId } = route.params;

  const { books, progress, aiHistory, addAIMessage } = useBookStore();
  const book = books.find((b) => b.id === bookId);
  const bookProgress = progress[bookId];
  const messages = aiHistory[bookId] || [];

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const currentChapter = bookProgress?.currentChapterIndex || 0;

  const addMessage = useCallback(
    (role: 'user' | 'assistant', content: string, type?: AIMessage['type']) => {
      const message: AIMessage = {
        id: `msg_${Date.now()}_${Math.random()}`,
        role,
        content,
        timestamp: Date.now(),
        type,
      };
      addAIMessage(bookId, message);
    },
    [bookId, addAIMessage]
  );

  const handleAIRequest = useCallback(
    async (
      type: AIMessage['type'],
      userMessage: string,
      aiFunction: () => Promise<string>
    ) => {
      if (!book || !isAIConfigured()) {
        Alert.alert(
          'AI Not Configured',
          'Please set your Gemini API key in the environment variables.'
        );
        return;
      }

      setLoading(true);
      addMessage('user', userMessage, type);

      try {
        const response = await aiFunction();
        addMessage('assistant', response, type);
      } catch (error) {
        addMessage(
          'assistant',
          'Sorry, I encountered an error. Please try again.',
          type
        );
      } finally {
        setLoading(false);
      }
    },
    [book, addMessage]
  );

  const handleSummary = useCallback(() => {
    if (!book) return;
    handleAIRequest('summary', "What's happened so far in the story?", () =>
      generateSummary(book.filePath, currentChapter)
    );
  }, [book, currentChapter, handleAIRequest]);

  const handleRecap = useCallback(() => {
    if (!book) return;
    handleAIRequest('recap', 'Give me a quick recap.', () =>
      generateRecap(book.filePath, currentChapter)
    );
  }, [book, currentChapter, handleAIRequest]);

  const handleCharacters = useCallback(() => {
    if (!book) return;
    handleAIRequest('character', 'Who are the characters so far?', () =>
      generateCharacterGuide(book.filePath, currentChapter)
    );
  }, [book, currentChapter, handleAIRequest]);

  const handleExplain = useCallback(() => {
    Alert.prompt?.(
      'What would you like explained?',
      'Enter a passage or concept',
      (text) => {
        if (text && book) {
          handleAIRequest('explain', `Explain: ${text}`, () =>
            askQuestion(`Please explain this: ${text}`, book.filePath, currentChapter)
          );
        }
      }
    ) ||
      Alert.alert(
        'Explain Feature',
        'Type your question in the chat below to ask about specific passages or concepts.'
      );
  }, [book, currentChapter, handleAIRequest]);

  const handleSend = useCallback(() => {
    if (!input.trim() || !book) return;

    const question = input.trim();
    setInput('');

    handleAIRequest('chat', question, () =>
      askQuestion(question, book.filePath, currentChapter)
    );
  }, [input, book, currentChapter, handleAIRequest]);

  const renderMessage = ({ item }: { item: AIMessage }) => (
    <View
      style={[
        styles.messageBubble,
        item.role === 'user' ? styles.userBubble : styles.assistantBubble,
      ]}
    >
      {item.type && item.role === 'user' && (
        <Text style={styles.messageType}>{item.type.toUpperCase()}</Text>
      )}
      <Text
        style={[
          styles.messageText,
          item.role === 'user' ? styles.userText : styles.assistantText,
        ]}
      >
        {item.content}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{book?.title}</Text>
        <Text style={styles.chapterInfo}>
          Reading: Chapter {currentChapter + 1}
          {book?.chapters[currentChapter]?.title &&
            ` - ${book.chapters[currentChapter].title}`}
        </Text>
      </View>

      <QuickActions
        onSummary={handleSummary}
        onRecap={handleRecap}
        onCharacters={handleCharacters}
        onExplain={handleExplain}
        disabled={loading}
      />

      {messages.length > 0 && (
        <View style={styles.divider}>
          <Text style={styles.dividerText}>Conversation</Text>
        </View>
      )}
    </View>
  );

  if (!book) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Book not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#e94560" />
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask about the story..."
            placeholderTextColor="#8b8b8b"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendButtonText}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
  },
  keyboardView: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  headerSection: {
    paddingTop: 8,
  },
  bookInfo: {
    padding: 16,
    backgroundColor: '#1a1a2e',
    marginBottom: 8,
  },
  bookTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  chapterInfo: {
    color: '#8b8b8b',
    fontSize: 13,
  },
  divider: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dividerText: {
    color: '#8b8b8b',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  messageBubble: {
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    borderRadius: 16,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: '#e94560',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#1a1a2e',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageType: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#e0e0e0',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    color: '#8b8b8b',
    marginLeft: 8,
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: '#2d3561',
  },
  input: {
    flex: 1,
    backgroundColor: '#2d3561',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: '#e94560',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#2d3561',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
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
});
