import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { Colors } from '../constants/Colors';
import { Spacing, BorderRadius, FontSize } from '../constants/Spacing';
import { JournalEntry } from '../types/Journal';
import { StorageManager } from '../utils/storage';
import { DateUtils } from '../utils/dateUtils';

interface EntryListItem {
  date: string;
  data: JournalEntry;
}

export default function HistoryScreen() {
  const [entries, setEntries] = useState<EntryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ totalEntries: 0, currentStreak: 0 });

  useFocusEffect(
    useCallback(() => {
      loadEntries();
      loadStats();
    }, [])
  );

  const loadEntries = async () => {
    try {
      const allEntries = await StorageManager.getAllEntries();
      setEntries(allEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await StorageManager.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    await loadStats();
    setRefreshing(false);
  };

  const createPreview = (entry: JournalEntry): string => {
    const sections = [entry.goodNew, entry.events, entry.growth, entry.tasks];
    return sections
      .filter(text => text && text.trim())
      .join(' ')
      .substring(0, 100) + '...';
  };

  const renderEntry = ({ item }: { item: EntryListItem }) => {
    const preview = createPreview(item.data);
    const isToday = DateUtils.isToday(item.date);

    return (
      <TouchableOpacity style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <Text style={[styles.entryDate, isToday && styles.todayDate]}>
            {DateUtils.formatDisplayDate(item.date)}
          </Text>
          {isToday && <Text style={styles.todayBadge}>今日</Text>}
        </View>
        <Text style={styles.entryPreview} numberOfLines={3}>
          {preview || '内容なし'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.totalEntries}</Text>
          <Text style={styles.statLabel}>記録</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.currentStreak}</Text>
          <Text style={styles.statLabel}>連続日数</Text>
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>まだ日記が記録されていません</Text>
      <Text style={styles.emptySubtitle}>「今日の日記」から最初の記録を始めましょう</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.date}
        renderItem={renderEntry}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        contentContainerStyle={[
          styles.listContainer,
          entries.length === 0 && styles.emptyListContainer,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary[600]]}
            tintColor={Colors.primary[600]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContainer: {
    padding: Spacing.lg,
  },
  emptyListContainer: {
    flex: 1,
  },
  statsContainer: {
    marginBottom: Spacing.xl,
  },
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: Colors.primary[600],
    lineHeight: FontSize['2xl'] * 1.2,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.gray[200],
    marginHorizontal: Spacing.lg,
  },
  entryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  entryDate: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary[600],
    flex: 1,
  },
  todayDate: {
    color: Colors.primary[700],
  },
  todayBadge: {
    backgroundColor: Colors.primary[100],
    color: Colors.primary[700],
    fontSize: FontSize.xs,
    fontWeight: '600',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  entryPreview: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: FontSize.sm * 1.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: FontSize.base * 1.5,
  },
});