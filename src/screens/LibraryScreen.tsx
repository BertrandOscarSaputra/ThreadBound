/**
 * Library screen - displays all imported books
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBookStore } from '../store/bookStore';
import { importBook, deleteBook } from '../services/bookService';
import { Book, RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Library'>;

export default function LibraryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { books, addBook, removeBook, progress } = useBookStore();
  const [loading, setLoading] = React.useState(false);

  const handleImport = useCallback(async () => {
    try {
      setLoading(true);
      const book = await importBook();
      if (book) {
        addBook(book);
      }
    } catch (error) {
      Alert.alert('Import Failed', 'Could not import the book. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [addBook]);

  const handleBookPress = useCallback(
    (book: Book) => {
      navigation.navigate('Reader', { bookId: book.id });
    },
    [navigation]
  );

  const handleBookLongPress = useCallback(
    (book: Book) => {
      Alert.alert('Delete Book', `Remove "${book.title}" from your library?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteBook(book);
            removeBook(book.id);
          },
        },
      ]);
    },
    [removeBook]
  );

  const getProgress = (bookId: string): number => {
    return progress[bookId]?.percentage || 0;
  };

  const renderBook = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => handleBookPress(item)}
      onLongPress={() => handleBookLongPress(item)}
      activeOpacity={0.7}
    >
      {item.coverUri ? (
        <Image source={{ uri: item.coverUri }} style={styles.cover} />
      ) : (
        <View style={styles.placeholderCover}>
          <Text style={styles.placeholderIcon}>📚</Text>
        </View>
      )}
      <View style={styles.bookInfo}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {item.author}
        </Text>
        {getProgress(item.id) > 0 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${getProgress(item.id)}%` }]} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📖</Text>
      <Text style={styles.emptyTitle}>No books yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button to import your first EPUB
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        columnWrapperStyle={styles.row}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={handleImport}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.fabIcon}>+</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  bookCard: {
    width: '48%',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  placeholderCover: {
    width: '100%',
    height: 180,
    backgroundColor: '#2d3561',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
  },
  bookInfo: {
    padding: 12,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  author: {
    color: '#8b8b8b',
    fontSize: 12,
  },
  progressContainer: {
    height: 3,
    backgroundColor: '#2d3561',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#e94560',
    borderRadius: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#8b8b8b',
    fontSize: 14,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e94560',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
  },
});
