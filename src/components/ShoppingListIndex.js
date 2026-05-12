import React, { useState } from 'react';
import {
  FiEdit2,
  FiPlus,
  FiShoppingCart,
  FiChevronDown,
  FiChevronRight,
} from 'react-icons/fi';
import clsx from 'clsx';
import ProductAccordion from './ProductAccordion';

/**
 * 買い物リスト画面
 *
 * - 外側アコーディオン: 各買い物リスト(グループ)
 *     左端チェック → 親側でモーダル確認 → リスト物理削除
 *     編集ボタン   → リスト編集画面へ
 * - 内側: そのリストに属する商品アイテムを表示
 *     ProductAccordion を showCheckbox モードで利用
 *     チェック → グレーアウト + 一番下に移動 (物理削除なし)
 *     未チェック群が上、チェック済み群が下に並ぶ
 *     各商品をさらにアコーディオン展開すると価格情報を表示
 */
const ShoppingListIndex = ({
  lists,
  items,
  products,
  getPriceRecordsByProduct,
  getListSummary,
  onCreateList,
  onEditList,
  onRequestDeleteList, // 親で確認モーダルを開く
  onToggleItem,
}) => {
  const [expandedListIds, setExpandedListIds] = useState(() => new Set());

  const toggleListExpand = (listId) => {
    setExpandedListIds((prev) => {
      const next = new Set(prev);
      if (next.has(listId)) next.delete(listId);
      else next.add(listId);
      return next;
    });
  };

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('ja-JP');
    } catch {
      return '-';
    }
  };

  // リストごとのアイテムを「未チェック → チェック済み」順に並べる
  const getOrderedItems = (listId) => {
    const listItems = items.filter((i) => i.listId === listId);
    const unchecked = listItems
      .filter((i) => !i.checked)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const checked = listItems
      .filter((i) => i.checked)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return [...unchecked, ...checked];
  };

  return (
    <div>
      <p className="mb-4 text-sm text-gray-600">
        買い物リストをアコーディオンで展開すると商品が表示されます。商品左のチェックで「買った」マーク（グレーアウト）、リスト左のチェックでリスト削除（要確認）です。
      </p>

      {lists.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white py-12 text-center">
          <div className="mb-4 text-gray-400">
            <FiShoppingCart className="mx-auto size-16" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            買い物リストがありません
          </h3>
          <p className="mb-4 text-gray-500">
            最初の買い物リストを作成しましょう
          </p>
          <button
            onClick={onCreateList}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
          >
            <FiPlus className="size-4" />
            新規リスト
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => {
            const summary = getListSummary(list.id);
            const isExpanded = expandedListIds.has(list.id);
            const orderedItems = getOrderedItems(list.id);
            const checkedCount = orderedItems.filter((i) => i.checked).length;

            return (
              <div
                key={list.id}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white"
              >
                {/* リストアコーディオンヘッダー */}
                <div
                  className={clsx(
                    'flex w-full items-center transition-colors',
                    isExpanded
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  )}
                >
                  {/* 左端: リスト削除トリガ */}
                  <label
                    className="flex cursor-pointer items-center pl-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          onRequestDeleteList(list);
                        }
                      }}
                      className="size-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      aria-label={`${list.name} を削除`}
                      title="チェックでリストを削除"
                    />
                  </label>

                  <button
                    onClick={() => toggleListExpand(list.id)}
                    className="flex flex-1 items-center justify-between px-4 py-3 text-left"
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold">
                        📝 {list.name}
                      </span>
                      <span
                        className={clsx(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          isExpanded
                            ? 'bg-white/20 text-white'
                            : 'bg-blue-500 text-white'
                        )}
                      >
                        {summary.total}件
                        {checkedCount > 0 && ` (買済 ${checkedCount})`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <FiChevronDown className="size-5" />
                      ) : (
                        <FiChevronRight className="size-5" />
                      )}
                    </div>
                  </button>

                  {/* 編集ボタン */}
                  <div className="pr-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onEditList(list)}
                      className={clsx(
                        'flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium transition-colors',
                        isExpanded
                          ? 'bg-white/20 text-white hover:bg-white/30'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      )}
                      title="編集"
                    >
                      <FiEdit2 className="size-3" />
                      編集
                    </button>
                  </div>
                </div>

                {/* リストアコーディオン中身 */}
                {isExpanded && (
                  <div className="bg-white">
                    {/* リストメモ・日付 */}
                    {(list.description || list.createdAt) && (
                      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
                        {list.description && (
                          <p className="text-sm text-gray-700">
                            {list.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          作成: {formatDate(list.createdAt)} / 更新:{' '}
                          {formatDate(list.updatedAt)}
                        </p>
                      </div>
                    )}

                    {/* 商品一覧 */}
                    <div className="p-4">
                      {orderedItems.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-8 text-center text-sm text-gray-500">
                          このリストには商品がありません。「編集」から商品を追加してください。
                        </div>
                      ) : (
                        orderedItems
                          .map((item) => {
                            const product = products.find(
                              (p) => p.id === item.productId
                            );
                            if (!product) return null;
                            return (
                              <ProductAccordion
                                key={item.id}
                                product={product}
                                priceRecords={getPriceRecordsByProduct(
                                  product.id
                                )}
                                showCheckbox
                                checked={!!item.checked}
                                itemId={item.id}
                                onCheck={(itemId) => onToggleItem(itemId)}
                                readOnly
                              />
                            );
                          })
                          .filter(Boolean)
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={onCreateList}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white py-4 text-gray-600 transition-colors hover:border-blue-400 hover:text-blue-600"
          >
            <FiPlus className="size-5" />
            新しい買い物リストを作成
          </button>
        </div>
      )}
    </div>
  );
};

export default ShoppingListIndex;
