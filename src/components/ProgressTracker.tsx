/**
 * Progress tracker component - displays reading progress
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useProgress } from '../store/bookStore';

interface ProgressTrackerProps {
  bookId: string;
  showLabel?: boolean;
  compact?: boolean;
}

export default function ProgressTracker({
  bookId,
  showLabel = true,
  compact = false,
}: ProgressTrackerProps) {
  const progress = useProgress();
  const bookProgress = progress[bookId];

  if (!bookProgress) {
    return null;
  }

  const { percentage, currentChapterIndex, totalPages } = bookProgress;

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactBar}>
          <View style={[styles.compactProgress, { width: `${percentage}%` }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            Chapter {currentChapterIndex + 1} of {totalPages}
          </Text>
          <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
        </View>
      )}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: '#8b8b8b',
    fontSize: 12,
  },
  percentage: {
    color: '#e94560',
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#2d3561',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#e94560',
    borderRadius: 3,
  },
  compactContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  compactBar: {
    height: 3,
    backgroundColor: '#2d3561',
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactProgress: {
    height: '100%',
    backgroundColor: '#e94560',
    borderRadius: 2,
  },
});
