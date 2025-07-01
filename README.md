# Journal - デスクトップ日記アプリ

モダンなデザインの日記アプリケーションです。Electronを使用してデスクトップアプリとして動作します。

## 機能

- 📝 4つのセクション構成の日記作成
  - GOOD & NEW
  - 何があって何を感じたか
  - 自分の成長のために抽象化すると
  - 今日やりきること

- 📱 レスポンシブデザイン対応
- 📊 統計表示（記録数・連続日数）
- 🔍 履歴検索・表示
- ✏️ 編集・削除機能
- 📋 コピー機能
- 📤 エクスポート機能（Markdown形式）
- ⌨️ キーボードショートカット対応
- 🎨 モダンなUI/UX

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発モードで実行

```bash
npm start
```

### 3. アプリケーションのビルド

```bash
# すべてのプラットフォーム
npm run build

# macOS用
npm run build-mac

# Windows用
npm run build-win

# Linux用
npm run build-linux
```

## キーボードショートカット

- `Cmd/Ctrl + N`: 新しい日記
- `Cmd/Ctrl + S`: 保存
- `Cmd/Ctrl + C`: コピー
- `Cmd/Ctrl + E`: エクスポート
- `Cmd/Ctrl + 1`: 今日の日記表示
- `Cmd/Ctrl + 2`: 履歴表示
- `Escape`: 戻る

## 技術仕様

- **Electron**: デスクトップアプリフレームワーク
- **HTML5/CSS3**: モダンなWeb標準
- **JavaScript ES6+**: クラスベースのアーキテクチャ
- **LocalStorage**: データ永続化
- **Inter Font**: 美しいタイポグラフィ

## ファイル構成

```
├── main.js          # Electronメインプロセス
├── preload.js       # セキュアな通信層
├── index.html       # UIアプリケーション
├── style.css        # デザインシステム
├── script.js        # アプリケーションロジック
├── package.json     # プロジェクト設定
└── assets/          # アプリケーションアセット
```

## ライセンス

MIT License