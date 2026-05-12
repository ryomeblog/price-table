# 底値表アプリ

各スーパーマーケットでの商品価格を比較・記録し、最安値で購入できるように支援するWebアプリケーションです。

## 機能概要

### 主要機能
- **商品管理**: 商品の登録、編集、削除
- **価格記録**: 各店舗での価格情報の記録・管理
- **最安値表示**: 商品ごとの最安値を自動計算・表示
- **検索機能**: 商品名による検索
- **買い物リスト**: 底値表に登録された商品から ToDo 形式の買い物リストをグループ単位で複数作成。買ったらチェックで物理削除
- **データ管理**: JSONファイルでのエクスポート・インポート

### 特徴
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップに対応
- **アコーディオン表示**: 商品ごとに価格情報を整理
- **リアルタイム計算**: 単価の自動計算
- **オフライン対応**: ローカルストレージによるデータ保存

## スクリーンショット

### 一覧画面
商品ごとにアコーディオン形式で価格情報を表示し、最安値が一目で分かります。

### 入力画面
直感的なフォームで価格情報を簡単に登録できます。

## 技術仕様

### フロントエンド
- **React 19.1.0**: UIライブラリ
- **Tailwind CSS 3.4.17**: CSSフレームワーク
- **React Icons 5.5.0**: アイコンライブラリ
- **clsx 2.1.1**: 条件付きCSS class管理

### 開発ツール
- **ESLint**: コード品質管理
- **Prettier**: コードフォーマット
- **PostCSS**: CSS処理
- **React Scripts**: 開発・ビルド環境

### データ管理
- **LocalStorage**: ブラウザローカルでのデータ永続化
- **JSON**: データエクスポート・インポート形式

## セットアップ

### 必要な環境
- Node.js 16.0.0 以上
- npm 7.0.0 以上

### インストール

1. リポジトリのクローン
```bash
git clone <repository-url>
cd price-table
```

2. 依存関係のインストール
```bash
npm install
```

3. 開発サーバーの起動
```bash
npm start
```

4. ブラウザで `http://localhost:3000` にアクセス

### ビルド
```bash
npm run build
```

## 使い方

### 1. 商品の追加
1. ヘッダーの「新規追加」ボタンをクリック
2. 商品名と説明（任意）を入力
3. 「登録」ボタンで保存

### 2. 価格情報の追加
1. 商品のアコーディオンを展開
2. 「価格を追加」ボタンをクリック
3. 価格、単位、数量、店舗名、備考を入力
4. 「登録」ボタンで保存

### 3. 最安値の確認
- 商品のアコーディオンヘッダーに最安値が表示
- 価格記録テーブルで最安値行が緑色でハイライト

### 4. 買い物リスト
1. ヘッダーの「買い物リスト」ボタンで買い物リスト画面に切替（ボタンは「底値表」表示に変わります）
2. 「新規リスト」でリストを作成。リスト名を入力し、底値表ビューから商品をチェックで選択して保存
3. リストカードをクリックすると詳細画面（底値表と同じアコーディオンで価格情報も確認可能）
4. 各アイテム左のチェックボックスを ON にすると「買った」とみなされ、確認後にそのアイテムを**物理削除**します（取り消し不可）
5. リスト自体は「編集」「削除」ボタンから操作可能

### 5. データの管理

#### エクスポート
1. ヘッダーの「エクスポート」ボタンをクリック
2. JSONファイルが自動ダウンロード（v1.1.0 では買い物リストも含まれます）

#### インポート
1. ヘッダーの「インポート」ボタンをクリック
2. JSONファイルを選択
3. データが読み込まれ、ページがリロード

#### データクリア
1. ヘッダーの「クリア」ボタンをクリック
2. 確認ダイアログで「OK」を選択
3. 全データが削除され、ページがリロード

## データ構造

詳細は `doc/データ設計.md` および `doc/買い物リスト機能設計.md` を参照してください。

### 商品 (Product)
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 価格記録 (PriceRecord)
```json
{
  "id": "string",
  "productId": "string",
  "price": "number",
  "unit": "string",
  "quantity": "number",
  "unitPrice": "number",
  "store": "string",
  "notes": "string",
  "isOnSale": "boolean",
  "purchaseDate": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 買い物リスト (ShoppingList)
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 買い物リストアイテム (ShoppingListItem)
```json
{
  "id": "string",
  "listId": "string",
  "productId": "string",
  "createdAt": "Date"
}
```
※「買った」操作は物理削除（論理削除ではない）。

## キーボードショートカット

### 全体
- `Ctrl + Enter`: フォーム送信
- `Esc`: モーダルを閉じる

### 検索
- 検索バーでの部分一致検索

## ファイル構成

```
price-table/
├── public/                 # 静的ファイル
├── src/
│   ├── components/         # Reactコンポーネント
│   │   ├── Header.js      # ヘッダーコンポーネント（ビュー切替を含む）
│   │   ├── SearchBar.js   # 検索バー
│   │   ├── ProductAccordion.js # 商品アコーディオン（通常/readOnly/selectable/showCheckbox の各モード）
│   │   ├── Modal.js       # モーダルコンポーネント
│   │   ├── ProductForm.js # 商品フォーム
│   │   ├── PriceRecordForm.js # 価格記録フォーム
│   │   ├── ShoppingListIndex.js  # 買い物リスト画面
│   │   ├── ShoppingListDetail.js # 買い物リスト詳細画面（商品詳細）
│   │   └── ShoppingListForm.js   # 買い物リスト追加・編集画面
│   ├── hooks/             # カスタムフック
│   │   ├── useProducts.js     # 商品管理
│   │   ├── usePriceRecords.js # 価格記録管理
│   │   └── useShoppingLists.js # 買い物リスト管理
│   ├── utils/             # ユーティリティ
│   │   ├── storage.js     # ストレージ管理
│   │   └── productFilter.js # 商品フィルタロジック（共通）
│   ├── App.js            # メインアプリケーション
│   ├── index.js          # エントリーポイント
│   └── index.css         # グローバルスタイル
├── design/               # 画面設計（SVG）
├── doc/                 # ドキュメント
└── README.md           # このファイル
```

## 開発

### 利用可能なスクリプト

```bash
npm start          # 開発サーバー起動
npm run build      # プロダクションビルド
npm test           # テスト実行
npm run lint       # ESLintでコードチェック
npm run format     # Prettierでコードフォーマット
```

### コーディング規約
- ESLint + Prettier による自動フォーマット
- Reactフック中心の関数型コンポーネント
- TailwindCSSによるユーティリティファーストCSS

## トラブルシューティング

### よくある問題

#### データが保存されない
- ブラウザのローカルストレージが無効になっていないか確認
- プライベートブラウジングモードでないか確認

#### エクスポート/インポートができない
- ブラウザがファイルダウンロード/アップロードを許可しているか確認
- JSONファイルの形式が正しいか確認

#### 表示が崩れる
- ブラウザキャッシュをクリア
- 対応ブラウザ（Chrome, Firefox, Safari, Edge）を使用

### サポートブラウザ
- Chrome 90+

## ライセンス

MIT License

## 貢献

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
