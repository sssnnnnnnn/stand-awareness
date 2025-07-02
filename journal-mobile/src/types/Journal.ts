// Journal types
export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  goodNew: string;
  events: string;
  growth: string;
  tasks: string;
  timestamp: string;
  lastModified: string;
}

export interface JournalSection {
  key: keyof Omit<JournalEntry, 'id' | 'date' | 'timestamp' | 'lastModified'>;
  title: string;
  emoji: string;
  placeholder: string;
}

export const JOURNAL_SECTIONS: JournalSection[] = [
  {
    key: 'goodNew',
    title: 'GOOD & NEW',
    emoji: '✨',
    placeholder: '今日あった良いことや新しい発見を書いてみましょう...',
  },
  {
    key: 'events',
    title: '何があって何を感じたか',
    emoji: '💭',
    placeholder: '今日の出来事とそのときの感情を記録しましょう...',
  },
  {
    key: 'growth',
    title: '自分の成長のために抽象化すると',
    emoji: '🌱',
    placeholder: '今日の経験から学んだことを抽象化して書きましょう...',
  },
  {
    key: 'tasks',
    title: '今日やりきること',
    emoji: '🎯',
    placeholder: '今日中に達成したいことを書きましょう...',
  },
];