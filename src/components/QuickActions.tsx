/**
 * Quick Actions component - predefined AI assistant actions
 */
import React, { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface QuickActionsProps {
  onSummary: () => void;
  onRecap: () => void;
  onCharacters: () => void;
  onExplain: () => void;
  disabled?: boolean;
}

interface ActionButton {
  id: string;
  icon: string;
  label: string;
  description: string;
  onPress: () => void;
}

function QuickActions({
  onSummary,
  onRecap,
  onCharacters,
  onExplain,
  disabled = false,
}: QuickActionsProps) {
  // Memoize actions array to prevent re-renders
  const actions: ActionButton[] = useMemo(
    () => [
      {
        id: 'summary',
        icon: '📖',
        label: 'Summary',
        description: "What's happened so far?",
        onPress: onSummary,
      },
      {
        id: 'recap',
        icon: '🔄',
        label: 'Quick Recap',
        description: 'Refresh my memory',
        onPress: onRecap,
      },
      {
        id: 'characters',
        icon: '👥',
        label: 'Characters',
        description: "Who's who?",
        onPress: onCharacters,
      },
      {
        id: 'explain',
        icon: '💡',
        label: 'Explain',
        description: 'Help me understand',
        onPress: onExplain,
      },
    ],
    [onSummary, onRecap, onCharacters, onExplain]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.grid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.card, disabled && styles.cardDisabled]}
            onPress={action.onPress}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{action.icon}</Text>
            <Text style={styles.label}>{action.label}</Text>
            <Text style={styles.description}>{action.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default memo(QuickActions);

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    color: '#8b8b8b',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2d3561',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 28,
    marginBottom: 8,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    color: '#8b8b8b',
    fontSize: 12,
  },
});
