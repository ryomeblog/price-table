あなたは以下のコーディングルールに従ってコードを記述します。

# コーディング規約

## 1. フォーム入力コンポーネントの実装規約

### 1.1 入力フィールドの実装方針

テキスト入力や数値入力などのユーザー入力が発生するフィールドでは、**スムーズな入力体験**を最優先とする。

#### ❌ 避けるべき実装（Controlled Component with onChange）

```javascript
// 悪い例：毎回onChangeが実行され、入力がスムーズでない
const [value, setValue] = useState('');

<Input
  value={value}
  onChange={(e) => setValue(e.target.value)} // 毎回実行される
/>;
```

#### ✅ 推奨実装（Uncontrolled Component with ref）

```javascript
// 良い例：uncontrolled component + ref
import { useRef } from 'react';

const inputRef = useRef(null);

const handleBlur = () => {
  if (inputRef.current) {
    const value = inputRef.current.value;
    setFormData((prev) => ({ ...prev, fieldName: value }));
  }
};

<Input
  ref={inputRef}
  defaultValue={initialValue}
  onBlur={handleBlur}
  // onChangeは使用しない
/>;
```

### 1.2 実装パターンの選択基準

| 入力タイプ           | 推奨実装              | 理由                       |
| -------------------- | --------------------- | -------------------------- |
| テキスト入力         | uncontrolled + ref    | 最もスムーズな入力体験     |
| 数値入力             | uncontrolled + ref    | 計算処理が重い場合の最適化 |
| 選択（Select/Radio） | controlled            | 選択は即座に反映が必要     |
| チェックボックス     | controlled            | 状態変更は即座に反映が必要 |
| 検索フィールド       | debounce + controlled | リアルタイム検索が必要     |

### 1.3 Selectコンポーネントの正しい使用方法

Selectコンポーネントは**controlled component**として使用し、**onChangeでeventオブジェクトを受け取る**ことを統一する。

#### ✅ 正しい実装

```javascript
<Select
  value={formData.year}
  onChange={(e) => setFormData((prev) => ({ ...prev, year: parseInt(e.target.value) }))}
  options={yearOptions}
/>
```

#### ❌ 避けるべき実装

```javascript
// 悪い例：valueを直接受け取る（動作が不安定）
<Select
  value={formData.year}
  onChange={(value) => setFormData((prev) => ({ ...prev, year: parseInt(value) }))}
  options={yearOptions}
/>
```

**重要:** Selectコンポーネントでは必ずeventオブジェクト（e）を受け取り、`e.target.value`で値を取得する。これにより、他のフォーム要素との一貫性を保ち、予期しない動作を防ぐ。

### 1.4 uncontrolled component実装テンプレート

```javascript
import React, { useState, useRef } from 'react';

const MyFormComponent = () => {
  // ref定義
  const textInputRef = useRef(null);
  const numberInputRef = useRef(null);

  // フォームデータ
  const [formData, setFormData] = useState({
    textField: '',
    numberField: 0,
    selectField: defaultValue, // Selectは controlled
  });

  // ブラー処理
  const handleTextBlur = () => {
    if (textInputRef.current) {
      const value = textInputRef.current.value;
      setFormData((prev) => ({ ...prev, textField: value }));
    }
  };

  const handleNumberBlur = () => {
    if (numberInputRef.current) {
      const value = parseFloat(numberInputRef.current.value) || 0;
      setFormData((prev) => ({ ...prev, numberField: value }));
    }
  };

  // Select用のchange処理
  const handleSelectChange = (e) => {
    setFormData((prev) => ({ ...prev, selectField: parseInt(e.target.value) }));
  };

  // 保存処理（最新値の取得）
  const handleSave = () => {
    // 保存前にrefから最新値を取得
    const finalData = {
      textField: textInputRef.current?.value || formData.textField,
      numberField: parseFloat(numberInputRef.current?.value) || formData.numberField,
      selectField: formData.selectField, // controlledなのでstateから取得
    };

    // バリデーション・保存処理
    console.log('保存データ:', finalData);
  };

  return (
    <form>
      <Input
        ref={textInputRef}
        defaultValue={formData.textField}
        onBlur={handleTextBlur}
        placeholder="テキストを入力"
      />

      <Input
        ref={numberInputRef}
        type="number"
        defaultValue={formData.numberField}
        onBlur={handleNumberBlur}
        placeholder="数値を入力"
      />

      <Select value={formData.selectField} onChange={handleSelectChange} options={selectOptions} />

      <Button onClick={handleSave}>保存</Button>
    </form>
  );
};
```


# 使用ライブラリについて

- Tailwind CSS
  - https://tailwindcss.com/plus/ui-blocks/preview
- react-icons
  - https://react-icons.github.io/react-icons/
- react-router-dom
- ESLint, Prettier
- clsx

# フォルダ構成について

## 概要

本プロジェクトは Reactで構築された底値表アプリケーションです。
Atomic Design パターンと Feature-based Architecture を組み合わせた構成で、保守性と拡張性を重視した設計となっています。
mobileで使用されることも考え、レスポンシブで開発することを前提としています。

## プロジェクト全体構成

```
price-table/
├── public/                  # 静的ファイル
│   ├── index.html          # エントリーポイント
│   ├── favicon.ico         # ファビコン
│   └── manifest.json       # PWA設定
├── src/                    # ソースコード
├── doc/                    # ドキュメント
├── .storybook/             # Storybook設定
├── package.json            # 依存関係定義
├── tailwind.config.js      # TailwindCSS設定
└── postcss.config.js       # PostCSS設定
```

## src/ フォルダ詳細構成

```
src/
├── components/            # コンポーネント
│   ├── ui/               # 基本UIコンポーネント
│   ├── layout/           # レイアウト関連コンポーネント
│   ├── forms/            # フォーム関連コンポーネント
│   └── pages/            # ページコンポーネント
├── assets/               # 静的アセット
├── constants/            # 定数定義
├── hooks/                # カスタムフック
├── services/             # API・外部サービス
├── store/                # 状態管理
├── utils/                # ユーティリティ関数
├── index.css             # メインCSS
├── index.js              # エントリーポイント
```

## 各フォルダの詳細

### `components/`

- **`ui/`**: 再利用可能な基本UIコンポーネント
- **`layout/`**: レイアウト構成要素（ヘッダー、設定系）
- **`forms/`**: フォーム関連コンポーネント
- **`pages/`**: 各画面のメインコンポーネント

### その他のフォルダ

- **`assets/`**: 静的ファイル（画像、スタイルなど）
- **`constants/`**: アプリ全体で使用する定数
- **`hooks/`**: カスタムReactフック
- **`services/`**: API通信など外部サービス
- **`store/`**: アプリケーション状態管理
- **`utils/`**: ユーティリティ関数
- **`Router.js`**: ルーティング設定

## 設計方針

### 1. コンポーネント分類

- **UI**: 汎用的な再利用可能コンポーネント（Button、Input、Modalなど）
- **Layout**: アプリケーション全体のレイアウト構成要素
- **Forms**: フォーム専用コンポーネント
- **Pages**: 各画面のメインコンポーネント（Router.jsでルーティング）

### 2. 命名規則

- **コンポーネント**: PascalCase（例: `TransactionList.js`）
- **フック**: camelCase + use接頭辞（例: `useTransactions.js`）
- **サービス**: camelCase（例: `apiService.js`）
- **ストア**: camelCase（例: `transactionStore.js`）

### 3. インポート規則

`components/ui/index.js` で一括エクスポートにより、きれいなインポートパスを提供

```javascript
// 推奨
import { Button, Input, Modal } from 'components/ui';
// 非推奨
import Button from 'components/ui/Button';
```
