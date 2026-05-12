import React from 'react';
import {
  FiPlus,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiShoppingCart,
  FiTag,
} from 'react-icons/fi';
import clsx from 'clsx';

const Header = ({
  view = 'priceTable', // 'priceTable' | 'shoppingList'
  onToggleView,
  onAddProduct,
  onExportData,
  onImportData,
  onClearData,
  className,
}) => {
  const isShoppingList = view === 'shoppingList';

  return (
    <header className={clsx('bg-blue-700 p-4 text-white shadow-lg', className)}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* タイトル */}
          <h1 className="text-xl font-bold sm:text-2xl">
            {isShoppingList ? '買い物リスト' : '底値表管理'}
          </h1>

          {/* アクションボタン */}
          <div className="flex flex-wrap gap-2">
            {/* ビュー切替ボタン */}
            <button
              onClick={onToggleView}
              className="flex items-center gap-2 rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium transition-colors hover:bg-sky-600"
              title={isShoppingList ? '底値表に切替' : '買い物リストに切替'}
            >
              {isShoppingList ? (
                <FiTag className="size-4" />
              ) : (
                <FiShoppingCart className="size-4" />
              )}
              <span className="hidden sm:inline">
                {isShoppingList ? '底値表' : '買い物リスト'}
              </span>
            </button>

            {/* 新規追加ボタン */}
            <button
              onClick={onAddProduct}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium transition-colors hover:bg-green-700"
            >
              <FiPlus className="size-4" />
              <span className="hidden sm:inline">
                {isShoppingList ? '新規リスト' : '新規追加'}
              </span>
              <span className="sm:hidden">追加</span>
            </button>

            {/* エクスポートボタン */}
            <button
              onClick={onExportData}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium transition-colors hover:bg-blue-700"
              title="データをエクスポート"
            >
              <FiDownload className="size-4" />
              <span className="hidden md:inline">エクスポート</span>
            </button>

            {/* インポートボタン */}
            <button
              onClick={onImportData}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium transition-colors hover:bg-purple-700"
              title="データをインポート"
            >
              <FiUpload className="size-4" />
              <span className="hidden md:inline">インポート</span>
            </button>

            {/* データクリアボタン */}
            <button
              onClick={onClearData}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium transition-colors hover:bg-red-700"
              title="全データを削除"
            >
              <FiTrash2 className="size-4" />
              <span className="hidden md:inline">クリア</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
