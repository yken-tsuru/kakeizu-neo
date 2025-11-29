# 🌳 家系図アプリ - Kakaizu Neo

家系図の作成、編集、表示ができるWebアプリケーションです。

## 📋 機能

- **家系図の作成**: 人物情報と関係性を登録
- **家系図の編集**: 人物情報や関係性の追加・編集・削除
- **家系図の表示**: グラフィカルな家系図の表示
- **家系図の保存**: データベースに自動保存
- **インポート/エクスポート**: CSV・JSON形式でのデータ入出力
- **フィルター機能**: 特定の人物とその関連する家系のみを表示

## 🎨 家系図の表示形式

- **夫婦**: 右に夫、左に妻を配置し、二重線で結ぶ
- **親子**: 両親の中心から一本線で子につなぐ
- **兄弟姉妹**: 両親の下に長男（長女）から順に右側から配置
- **養子**: 太い枠線で表示
- **前配偶者**: 点線で表示
- **配偶者なし**: 下線を表示

## 🚀 起動方法

### 前提条件

- Docker Desktop がインストールされていること
- Docker Compose が利用可能であること

### 起動手順

1. **プロジェクトディレクトリに移動**

```bash
cd c:\10_apps\kakaizu-neo
```

2. **Docker Composeでアプリケーションを起動**

```bash
docker-compose up --build
```

3. **ブラウザでアクセス**

```
http://localhost:3002
```

### 停止方法

```bash
docker-compose down
```

## 📖 使い方

### 1. 家系図の表示

- 「家系図表示」タブで家系図を確認できます
- フィルター機能で特定の人物とその関連家系のみを表示できます

### 2. 人物の追加・編集

1. 「編集」タブを開く
2. 「➕ 人物を追加」ボタンをクリック
3. 必要な情報を入力
   - 名前（必須）
   - 性別
   - 生年月日（例: 1980年1月1日 または 1980）
   - 没年月日
   - 養子かどうか
   - 備考
4. 「保存」ボタンをクリック

### 3. 関係の追加

1. 「編集」タブを開く
2. 「🔗 関係を追加」ボタンをクリック
3. 関係を設定
   - 人物1を選択
   - 人物2を選択
   - 関係の種類を選択（配偶者、前配偶者、親子）
4. 「保存」ボタンをクリック

### 4. CSVインポート

1. 「インポート/エクスポート」タブを開く
2. CSV形式でデータを入力
   - 形式: `名前,性別,生年月日,没年月日,養子,備考`
   - 例: `山田太郎,男性,1950年1月1日,2020年12月31日,false,備考欄`
3. 「CSVをインポート」ボタンをクリック

### 5. JSONインポート

1. 「インポート/エクスポート」タブを開く
2. JSON形式でデータを入力
   ```json
   {
     "persons": [
       {
         "name": "山田太郎",
         "gender": "男性",
         "birth_date": "1950年1月1日",
         "death_date": "2020年12月31日",
         "is_adopted": false,
         "notes": "備考"
       }
     ],
     "relationships": [
       {
         "person1_id": 1,
         "person2_id": 2,
         "type": "spouse"
       }
     ]
   }
   ```
3. 「JSONをインポート」ボタンをクリック

### 6. エクスポート

- 「インポート/エクスポート」タブで「CSVでエクスポート」または「JSONでエクスポート」ボタンをクリック
- ファイルが自動的にダウンロードされます

## 🗂️ プロジェクト構成

```
kakaizu-neo/
├── server.js           # Express サーバー
├── database.js         # データベース設定
├── package.json        # 依存関係
├── Dockerfile          # Docker イメージ設定
├── docker-compose.yml  # Docker Compose 設定
├── public/             # フロントエンド
│   ├── index.html      # メインHTML
│   ├── style.css       # スタイルシート
│   └── app.js          # JavaScript
└── data/               # データベースファイル（自動生成）
    └── family_tree.db
```

## 🔧 技術スタック

- **フロントエンド**: HTML5, CSS3, JavaScript
- **バックエンド**: Node.js, Express
- **データベース**: SQLite
- **コンテナ**: Docker, Docker Compose

## 📊 データベーススキーマ

### Persons テーブル

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | INTEGER | 主キー |
| name | STRING | 名前 |
| gender | STRING | 性別 |
| birth_date | STRING | 生年月日 |
| death_date | STRING | 没年月日 |
| is_adopted | BOOLEAN | 養子フラグ |
| notes | TEXT | 備考 |

### Relationships テーブル

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | INTEGER | 主キー |
| person1_id | INTEGER | 人物1のID |
| person2_id | INTEGER | 人物2のID |
| type | STRING | 関係の種類 (spouse, ex_spouse, parent_child) |

## 🛠️ 開発モード

開発時は以下のコマンドでnodemonを使用した自動リロードが可能です:

```bash
npm install
npm run dev
```

## ⚠️ 注意事項

- データは `data/family_tree.db` に保存されます
- Docker Composeを停止してもデータは保持されます
- データを完全に削除する場合は `data` ディレクトリを削除してください

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。
# kakeizu-neo
