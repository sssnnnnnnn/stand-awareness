import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalEntry } from '../types/Journal';

const STORAGE_PREFIX = 'journal-';

export class StorageManager {
  static getKey(date: string): string {
    return `${STORAGE_PREFIX}${date}`;
  }

  static async getEntry(date: string): Promise<JournalEntry | null> {
    try {
      const key = this.getKey(date);
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading entry:', error);
      return null;
    }
  }

  static async saveEntry(date: string, entry: Omit<JournalEntry, 'id' | 'date' | 'timestamp' | 'lastModified'>): Promise<boolean> {
    try {
      const key = this.getKey(date);
      const now = new Date().toISOString();
      
      const existingEntry = await this.getEntry(date);
      
      const entryData: JournalEntry = {
        id: existingEntry?.id || `entry-${Date.now()}`,
        date,
        ...entry,
        timestamp: existingEntry?.timestamp || now,
        lastModified: now,
      };

      await AsyncStorage.setItem(key, JSON.stringify(entryData));
      return true;
    } catch (error) {
      console.error('Error saving entry:', error);
      return false;
    }
  }

  static async deleteEntry(date: string): Promise<boolean> {
    try {
      const key = this.getKey(date);
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error deleting entry:', error);
      return false;
    }
  }

  static async getAllEntries(): Promise<{ date: string; data: JournalEntry }[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const journalKeys = keys.filter(key => key.startsWith(STORAGE_PREFIX));
      
      const entries = await Promise.all(
        journalKeys.map(async (key) => {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const entry = JSON.parse(data);
            const date = key.replace(STORAGE_PREFIX, '');
            return { date, data: entry };
          }
          return null;
        })
      );

      return entries
        .filter((entry): entry is { date: string; data: JournalEntry } => entry !== null)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error loading all entries:', error);
      return [];
    }
  }

  static async getStats(): Promise<{ totalEntries: number; currentStreak: number }> {
    const entries = await this.getAllEntries();
    const totalEntries = entries.length;
    
    if (totalEntries === 0) {
      return { totalEntries: 0, currentStreak: 0 };
    }

    // Calculate streak
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasEntry = entries.some(entry => entry.date === dateStr);
      
      if (hasEntry) {
        streak++;
      } else if (dateStr !== today.toISOString().split('T')[0]) {
        break;
      }
      
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return { totalEntries, currentStreak: streak };
  }
}