import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';

import { Colors } from '../constants/Colors';
import { Spacing, BorderRadius, FontSize } from '../constants/Spacing';
import { JournalEntry } from '../types/Journal';
import { StorageManager } from '../utils/storage';
import { DateUtils } from '../utils/dateUtils';

interface MarkedDates {
  [key: string]: {
    marked?: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
  };
}

export default function CalendarScreen() {
  const [entries, setEntries] = useState<{ [key: string]: JournalEntry }>({});
  const [selectedDate, setSelectedDate] = useState<string>(DateUtils.getToday());
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

  const loadEntries = async () => {
    try {
      const allEntries = await StorageManager.getAllEntries();
      const entriesMap: { [key: string]: JournalEntry } = {};
      const marked: MarkedDates = {};

      allEntries.forEach(({ date, data }) => {
        entriesMap[date] = data;
        marked[date] = {
          marked: true,
          dotColor: Colors.primary[600],
        };
      });

      // Mark today
      const today = DateUtils.getToday();
      marked[today] = {
        ...marked[today],
        selected: true,
        selectedColor: Colors.primary[100],
      };

      setEntries(entriesMap);
      setMarkedDates(marked);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const handleDayPress = (day: any) => {
    const dateStr = day.dateString;
    setSelectedDate(dateStr);

    // Update marked dates
    const newMarkedDates = { ...markedDates };
    
    // Remove previous selection
    Object.keys(newMarkedDates).forEach(date => {
      if (newMarkedDates[date].selected) {
        newMarkedDates[date] = {
          ...newMarkedDates[date],
          selected: false,
          selectedColor: undefined,
        };
      }
    });

    // Add new selection
    newMarkedDates[dateStr] = {
      ...newMarkedDates[dateStr],
      selected: true,
      selectedColor: Colors.primary[100],
    };

    setMarkedDates(newMarkedDates);

    // Check if entry exists and show appropriate action
    const entry = entries[dateStr];
    if (entry) {
      showEntryPreview(dateStr, entry);
    } else {
      const isToday = DateUtils.isToday(dateStr);
      if (isToday) {
        Alert.alert(
          '今日の日記',
          '今日の日記を作成しますか？',
          [
            { text: 'キャンセル', style: 'cancel' },
            { text: '作成する', onPress: () => navigateToToday() },
          ]
        );
      } else {
        const formattedDate = DateUtils.formatDisplayDate(dateStr);
        Alert.alert('日記なし', `${formattedDate}の日記はまだ作成されていません`);
      }
    }
  };

  const showEntryPreview = (dateStr: string, entry: JournalEntry) => {
    const formattedDate = DateUtils.formatDisplayDate(dateStr);
    const preview = createPreview(entry);
    
    Alert.alert(
      formattedDate,
      preview,
      [
        { text: '閉じる', style: 'cancel' },
        { text: '詳細を見る', onPress: () => showEntryDetail(entry) },
      ]
    );
  };

  const showEntryDetail = (entry: JournalEntry) => {
    const sections = [
      { title: 'GOOD & NEW ✨', content: entry.goodNew },
      { title: '何があって何を感じたか 💭', content: entry.events },
      { title: '自分の成長のために抽象化すると 🌱', content: entry.growth },
      { title: '今日やりきること 🎯', content: entry.tasks },
    ];

    const detailText = sections
      .filter(section => section.content && section.content.trim())
      .map(section => `${section.title}\n${section.content}`)
      .join('\n\n');

    Alert.alert(
      DateUtils.formatDisplayDate(entry.date),
      detailText || '内容なし',
      [{ text: '閉じる' }]
    );
  };

  const createPreview = (entry: JournalEntry): string => {
    const sections = [entry.goodNew, entry.events, entry.growth, entry.tasks];
    const preview = sections
      .filter(text => text && text.trim())
      .join(' ')
      .substring(0, 150);
    return preview || '内容なし';
  };

  const navigateToToday = () => {
    // This would navigate to Today tab
    // For now, just show an alert
    Alert.alert('ナビゲーション', '「今日の日記」タブに移動してください');
  };

  const getSelectedDateInfo = () => {
    const entry = entries[selectedDate];
    const formattedDate = DateUtils.formatDisplayDate(selectedDate);
    const isToday = DateUtils.isToday(selectedDate);

    return (
      <View style={styles.selectedDateContainer}>
        <Text style={styles.selectedDateTitle}>
          {formattedDate}
          {isToday && <Text style={styles.todayLabel}> (今日)</Text>}
        </Text>
        {entry ? (
          <View style={styles.entryPreviewContainer}>
            <Text style={styles.entryPreviewText} numberOfLines={3}>
              {createPreview(entry)}
            </Text>
            <TouchableOpacity
              style={styles.viewDetailButton}
              onPress={() => showEntryDetail(entry)}
            >
              <Text style={styles.viewDetailButtonText}>詳細を見る</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.noEntryText}>
            {isToday ? '今日の日記を作成しましょう' : 'この日の日記はありません'}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Calendar
        current={selectedDate}
        onDayPress={handleDayPress}
        monthFormat={'yyyy年M月'}
        hideExtraDays={true}
        firstDay={0} // Sunday first
        showWeekNumbers={false}
        disableMonthChange={false}
        enableSwipeMonths={true}
        markedDates={markedDates}
        style={styles.calendar}
        theme={{
          backgroundColor: Colors.surface,
          calendarBackground: Colors.surface,
          textSectionTitleColor: Colors.text.secondary,
          selectedDayBackgroundColor: Colors.primary[600],
          selectedDayTextColor: Colors.surface,
          todayTextColor: Colors.primary[600],
          dayTextColor: Colors.text.primary,
          textDisabledColor: Colors.gray[300],
          dotColor: Colors.primary[600],
          selectedDotColor: Colors.surface,
          arrowColor: Colors.primary[600],
          monthTextColor: Colors.text.primary,
          indicatorColor: Colors.primary[600],
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontWeight: '400',
          textMonthFontWeight: '600',
          textDayHeaderFontWeight: '600',
          textDayFontSize: FontSize.sm,
          textMonthFontSize: FontSize.lg,
          textDayHeaderFontSize: FontSize.xs,
        }}
      />
      
      {getSelectedDateInfo()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  selectedDateContainer: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    borderRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDateTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  todayLabel: {
    color: Colors.primary[600],
    fontSize: FontSize.sm,
  },
  entryPreviewContainer: {
    gap: Spacing.md,
  },
  entryPreviewText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: FontSize.sm * 1.5,
  },
  viewDetailButton: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  viewDetailButtonText: {
    color: Colors.surface,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  noEntryText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
});