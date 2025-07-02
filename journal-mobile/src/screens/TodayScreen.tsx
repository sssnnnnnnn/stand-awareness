import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../constants/Colors';
import { Spacing, BorderRadius, FontSize } from '../constants/Spacing';
import { JOURNAL_SECTIONS, JournalEntry } from '../types/Journal';
import { StorageManager } from '../utils/storage';
import { DateUtils } from '../utils/dateUtils';

export default function TodayScreen() {
  const [entry, setEntry] = useState({
    goodNew: '',
    events: '',
    growth: '',
    tasks: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const today = DateUtils.getToday();

  useEffect(() => {
    loadTodayEntry();
  }, []);

  const loadTodayEntry = async () => {
    setIsLoading(true);
    try {
      const todayEntry = await StorageManager.getEntry(today);
      if (todayEntry) {
        setEntry({
          goodNew: todayEntry.goodNew,
          events: todayEntry.events,
          growth: todayEntry.growth,
          tasks: todayEntry.tasks,
        });
      }
    } catch (error) {
      console.error('Error loading today entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Check if at least one field is filled
    const isEmpty = Object.values(entry).every(value => !value.trim());
    
    if (isEmpty) {
      Alert.alert('入力エラー', '少なくとも1つの項目に入力してください');
      return;
    }

    setIsSaving(true);
    try {
      const success = await StorageManager.saveEntry(today, entry);
      if (success) {
        Alert.alert('保存完了', '日記を保存しました！');
      } else {
        Alert.alert('エラー', '保存に失敗しました');
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('エラー', '保存中にエラーが発生しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    Alert.alert(
      '確認',
      '本当に日記をクリアしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'クリア',
          style: 'destructive',
          onPress: () => {
            setEntry({
              goodNew: '',
              events: '',
              growth: '',
              tasks: '',
            });
          },
        },
      ]
    );
  };

  const updateEntry = (key: string, value: string) => {
    setEntry(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{DateUtils.formatDisplayDate(today)}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.clearButton]}
              onPress={handleClear}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.error[500]} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Ionicons name="save-outline" size={20} color={Colors.surface} />
              <Text style={styles.saveButtonText}>
                {isSaving ? '保存中...' : '保存'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {JOURNAL_SECTIONS.map((section) => (
            <View key={section.key} style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionEmoji}>{section.emoji}</Text>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder={section.placeholder}
                placeholderTextColor={Colors.gray[400]}
                value={entry[section.key]}
                onChangeText={(text) => updateEntry(section.key, text)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          ))}
          
          {/* Extra padding for keyboard */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSize.base,
    color: Colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  dateText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  clearButton: {
    backgroundColor: Colors.error[50],
  },
  saveButton: {
    backgroundColor: Colors.primary[600],
  },
  saveButtonText: {
    color: Colors.surface,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  sectionContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionEmoji: {
    fontSize: FontSize.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    fontSize: FontSize.base,
    color: Colors.text.primary,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  bottomPadding: {
    height: 100,
  },
});