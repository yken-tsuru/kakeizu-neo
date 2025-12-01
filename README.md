# Kakaizu Neo - 家系図アプリ (Rails + Tailwind)

家系図の作成・編集・表示を行うWebアプリケーション。Ruby on Rails + Tailwind CSSで構築されています。

## 技術スタック

- **Backend**: Ruby on Rails 7.1
- **Frontend**: Tailwind CSS
- **Database**: SQLite3
- **Visualization**: HTML5 Canvas (JavaScript)
- **Container**: Docker

## セットアップ

### Dockerを使用する場合（推奨）

1. リポジトリをクローン
```bash
git clone <repository-url>
cd kakaizu-neo
```

2. Dockerイメージをビルド
```bash
docker-compose build
```

3. データベースをセットアップ
```bash
docker-compose run web rails db:create db:migrate
```

4. データをインポート（backup.jsonがある場合）
```bash
docker-compose run web rails db:seed
```

5. サーバーを起動
```bash
docker-compose up
```

6. ブラウザで http://localhost:3000 にアクセス

### ローカル環境で実行する場合

1. Ruby 3.2以上をインストール

2. 依存関係をインストール
```bash
bundle install
```

3. データベースをセットアップ
```bash
rails db:create db:migrate db:seed
```

4. Tailwind CSSをビルド（別ターミナル）
```bash
rails tailwindcss:watch
```

5. サーバーを起動
```bash
rails server
```

6. ブラウザで http://localhost:3000 にアクセス

## 機能

- **人物管理**: 家系図に登録する人物の追加・編集・削除
- **関係管理**: 人物間の関係（配偶者、親子など）の設定
- **家系図表示**: Canvas上に家系図を視覚的に表示
- **データインポート**: backup.jsonからのデータ移行

## データ構造

### Person（人物）
- name: 名前
- gender: 性別（男性/女性）
- birth_date: 生年月日
- death_date: 没年月日
- is_adopted: 養子フラグ
- notes: 備考

### Relationship（関係）
- person1_id: 人物1のID
- person2_id: 人物2のID
- relationship_type: 関係の種類
  - `spouse`: 配偶者
  - `ex_spouse`: 前配偶者
  - `parent_child`: 親子

## 開発

### テスト実行
```bash
rails test
```

### コンソール
```bash
rails console
```

## ライセンス

MIT License
