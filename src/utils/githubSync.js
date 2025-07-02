// GitHub Issues を使用した同期機能
class GitHubSync {
  constructor() {
    this.owner = 'sssnnnnnnn';
    this.repo = 'stand-awareness';
    this.token = localStorage.getItem('github_token');
    this.apiBase = 'https://api.github.com';
  }

  // トークン設定
  setToken(token) {
    this.token = token;
    localStorage.setItem('github_token', token);
  }

  // トークン確認
  hasToken() {
    return !!this.token;
  }

  // API リクエスト共通処理
  async apiRequest(endpoint, options = {}) {
    const url = `${this.apiBase}${endpoint}`;
    const headers = {
      'Authorization': `token ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GitHub API request failed:', error);
      throw error;
    }
  }

  // 日記エントリーをIssueタイトル形式に変換
  entryToIssueTitle(date, entry) {
    const formattedDate = new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
    return `📝 ${formattedDate}の日記`;
  }

  // 日記エントリーをIssue本文形式に変換
  entryToIssueBody(entry) {
    const sections = [
      { key: 'goodNew', title: 'GOOD & NEW', emoji: '✨' },
      { key: 'events', title: '何があって何を感じたか', emoji: '💭' },
      { key: 'growth', title: '自分の成長のために抽象化すると', emoji: '🌱' },
      { key: 'tasks', title: '今日やりきること', emoji: '🎯' }
    ];

    let body = '<!-- Journal Entry Data -->\n';
    body += `<!-- Created: ${entry.timestamp} -->\n`;
    body += `<!-- Modified: ${entry.lastModified} -->\n\n`;

    sections.forEach(section => {
      if (entry[section.key] && entry[section.key].trim()) {
        body += `## ${section.emoji} ${section.title}\n\n`;
        body += `${entry[section.key].trim()}\n\n`;
      }
    });

    // 検索用のメタデータを追加
    body += `---\n`;
    body += `**Date:** ${entry.date}\n`;
    body += `**Created:** ${new Date(entry.timestamp).toLocaleString('ja-JP')}\n`;
    body += `**Modified:** ${new Date(entry.lastModified).toLocaleString('ja-JP')}\n`;

    return body;
  }

  // Issue本文からエントリーデータを復元
  issueBodyToEntry(body, date) {
    const entry = {
      date: date,
      goodNew: '',
      events: '',
      growth: '',
      tasks: '',
      timestamp: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    // タイムスタンプを抽出
    const createdMatch = body.match(/<!-- Created: (.+?) -->/);
    const modifiedMatch = body.match(/<!-- Modified: (.+?) -->/);
    
    if (createdMatch) entry.timestamp = createdMatch[1];
    if (modifiedMatch) entry.lastModified = modifiedMatch[1];

    // セクションを抽出
    const sections = [
      { key: 'goodNew', pattern: /## ✨ GOOD & NEW\n\n(.*?)(?=\n## |---|\n\n---|\n$)/s },
      { key: 'events', pattern: /## 💭 何があって何を感じたか\n\n(.*?)(?=\n## |---|\n\n---|\n$)/s },
      { key: 'growth', pattern: /## 🌱 自分の成長のために抽象化すると\n\n(.*?)(?=\n## |---|\n\n---|\n$)/s },
      { key: 'tasks', pattern: /## 🎯 今日やりきること\n\n(.*?)(?=\n## |---|\n\n---|\n$)/s }
    ];

    sections.forEach(section => {
      const match = body.match(section.pattern);
      if (match) {
        entry[section.key] = match[1].trim();
      }
    });

    return entry;
  }

  // 日記エントリーをクラウドに保存
  async saveEntry(date, entry) {
    if (!this.hasToken()) {
      throw new Error('GitHub token is required');
    }

    const title = this.entryToIssueTitle(date, entry);
    const body = this.entryToIssueBody(entry);
    const label = `date:${date}`;

    try {
      // 既存のIssueを検索
      const existingIssues = await this.apiRequest(
        `/repos/${this.owner}/${this.repo}/issues?labels=${encodeURIComponent(label)}&state=all`
      );

      let issueNumber;
      
      if (existingIssues.length > 0) {
        // 既存のIssueを更新
        issueNumber = existingIssues[0].number;
        await this.apiRequest(`/repos/${this.owner}/${this.repo}/issues/${issueNumber}`, {
          method: 'PATCH',
          body: JSON.stringify({
            title: title,
            body: body,
            state: 'open'
          })
        });
      } else {
        // 新しいIssueを作成
        const newIssue = await this.apiRequest(`/repos/${this.owner}/${this.repo}/issues`, {
          method: 'POST',
          body: JSON.stringify({
            title: title,
            body: body,
            labels: [label, 'journal-entry']
          })
        });
        issueNumber = newIssue.number;
      }

      return { success: true, issueNumber };
    } catch (error) {
      console.error('Failed to save entry to GitHub:', error);
      throw error;
    }
  }

  // 特定の日付のエントリーをクラウドから取得
  async getEntry(date) {
    if (!this.hasToken()) {
      return null;
    }

    try {
      const label = `date:${date}`;
      const issues = await this.apiRequest(
        `/repos/${this.owner}/${this.repo}/issues?labels=${encodeURIComponent(label)}&state=all`
      );

      if (issues.length > 0) {
        const issue = issues[0];
        return this.issueBodyToEntry(issue.body, date);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get entry from GitHub:', error);
      return null;
    }
  }

  // すべてのエントリーをクラウドから取得
  async getAllEntries() {
    if (!this.hasToken()) {
      return [];
    }

    try {
      const issues = await this.apiRequest(
        `/repos/${this.owner}/${this.repo}/issues?labels=journal-entry&state=all&per_page=100`
      );

      const entries = [];
      
      for (const issue of issues) {
        // ラベルから日付を抽出
        const dateLabel = issue.labels.find(label => label.name.startsWith('date:'));
        if (dateLabel) {
          const date = dateLabel.name.replace('date:', '');
          const entry = this.issueBodyToEntry(issue.body, date);
          entries.push({ date, data: entry });
        }
      }

      // 日付順でソート
      entries.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      return entries;
    } catch (error) {
      console.error('Failed to get all entries from GitHub:', error);
      return [];
    }
  }

  // エントリーを削除
  async deleteEntry(date) {
    if (!this.hasToken()) {
      throw new Error('GitHub token is required');
    }

    try {
      const label = `date:${date}`;
      const issues = await this.apiRequest(
        `/repos/${this.owner}/${this.repo}/issues?labels=${encodeURIComponent(label)}&state=all`
      );

      if (issues.length > 0) {
        const issueNumber = issues[0].number;
        await this.apiRequest(`/repos/${this.owner}/${this.repo}/issues/${issueNumber}`, {
          method: 'PATCH',
          body: JSON.stringify({
            state: 'closed'
          })
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to delete entry from GitHub:', error);
      throw error;
    }
  }

  // 同期状態をチェック
  async checkSyncStatus() {
    if (!this.hasToken()) {
      return { canSync: false, error: 'No token' };
    }

    try {
      // リポジトリへのアクセスをテスト
      await this.apiRequest(`/repos/${this.owner}/${this.repo}`);
      return { canSync: true };
    } catch (error) {
      return { canSync: false, error: error.message };
    }
  }
}

// シングルトンインスタンス
window.githubSync = new GitHubSync();