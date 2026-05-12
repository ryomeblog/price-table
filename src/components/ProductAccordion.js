import React, { useState } from 'react';
import {
  FiChevronDown,
  FiChevronRight,
  FiEdit2,
  FiTrash2,
} from 'react-icons/fi';
import clsx from 'clsx';

/**
 * 小数第5位以下を切り捨てて小数第4位まで表示する関数
 */
function truncateTo4Decimals(num) {
  if (isNaN(num)) return '';
  return Math.floor(num * 10000) / 10000;
}

/**
 * ProductAccordion
 *
 * モード:
 *   - 通常モード (デフォルト)            : 編集/削除/価格追加ボタンを表示
 *   - readOnly  : 編集/削除/価格追加ボタンを非表示 (詳細表示専用)
 *   - selectable: 左端にチェックボックスを表示 (フォーム選択用)
 *   - showCheckbox: 左端にチェックボックスを表示 (買い物リスト画面の「買った」マーク用)
 *                   `checked` で現在の状態を表現し、ON/OFF どちらも `onCheck` が呼ばれる。
 *                   `checked === true` の時は行全体をグレーアウトする。
 */
const ProductAccordion = ({
  product,
  priceRecords,
  onEditProduct,
  onDeleteProduct,
  onEditPriceRecord,
  onDeletePriceRecord,
  onAddPriceRecord,
  // モード関連 props
  readOnly = false,
  selectable = false,
  selected = false,
  onSelectChange,
  showCheckbox = false,
  checked = false,
  onCheck,
  // 詳細画面でリストから削除するための item.id
  itemId,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 単価計算（小数第4位切り捨て）
  const calcUnitPrice = (price, quantity) => {
    if (!price || !quantity || isNaN(price) || isNaN(quantity) || quantity == 0)
      return '';
    return truncateTo4Decimals(Number(price) / Number(quantity));
  };

  // 最安値レコードを計算
  const cheapestRecord =
    priceRecords && priceRecords.length > 0
      ? priceRecords.reduce((minRec, rec) => {
          const recUnit = calcUnitPrice(rec.price, rec.quantity);
          if (recUnit === '') return minRec;
          if (!minRec) return rec;
          const minUnit = calcUnitPrice(minRec.price, minRec.quantity);
          return recUnit < minUnit ? rec : minRec;
        }, null)
      : null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price);
  };

  const hasCheckbox = selectable || showCheckbox;
  const isGrayedOut = showCheckbox && checked;

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    if (selectable && onSelectChange) {
      onSelectChange(product.id, e.target.checked);
    } else if (showCheckbox && onCheck) {
      // ON/OFF どちらも通知（呼び出し側でトグル）
      onCheck(itemId, product, e.target.checked);
    }
  };

  const checkboxChecked = selectable ? !!selected : !!checked;

  return (
    <div
      className={clsx(
        'mb-4 overflow-hidden rounded-lg border border-gray-200',
        isGrayedOut && 'opacity-60'
      )}
    >
      {/* アコーディオンヘッダー */}
      <div
        className={clsx(
          'flex w-full items-center transition-colors',
          isGrayedOut
            ? 'bg-gray-300 text-gray-600'
            : isExpanded
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        )}
      >
        {hasCheckbox && (
          <label
            className="flex cursor-pointer items-center pl-4"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={checkboxChecked}
              onChange={handleCheckboxChange}
              className="size-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              aria-label={
                selectable
                  ? `${product.name} を選択`
                  : checkboxChecked
                    ? `${product.name} のチェックを外す`
                    : `${product.name} を買った`
              }
            />
          </label>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex flex-1 items-center justify-between px-4 py-3 text-left"
          type="button"
        >
          <div className="flex items-center gap-3">
            <span
              className={clsx(
                'text-lg font-semibold',
                isGrayedOut && 'line-through'
              )}
            >
              {product.name}
            </span>
            {priceRecords.length > 0 && (
              <span className="text-sm opacity-75">
                ({priceRecords.length}件の価格情報)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* 最安値表示 */}
            {cheapestRecord && (
              <span className="rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white">
                最安値:{' '}
                {calcUnitPrice(
                  cheapestRecord.price,
                  cheapestRecord.quantity
                ).toFixed(4)}
                /{product.unit}
              </span>
            )}

            {/* 展開アイコン */}
            {isExpanded ? (
              <FiChevronDown className="size-5" />
            ) : (
              <FiChevronRight className="size-5" />
            )}
          </div>
        </button>
      </div>

      {/* アコーディオンコンテンツ */}
      {isExpanded && (
        <div className="bg-white">
          {/* 商品説明 */}
          {product.description && (
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
              <p className="text-sm text-gray-600">{product.description}</p>
            </div>
          )}

          {/* 価格記録がない場合 */}
          {priceRecords.length === 0 ? (
            <div className="p-6 text-center">
              <p className="mb-4 text-gray-500">
                まだ価格情報が登録されていません
              </p>
              {!readOnly && onAddPriceRecord && (
                <button
                  onClick={() => onAddPriceRecord(product.id)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  価格を追加
                </button>
              )}
            </div>
          ) : (
            <>
              {/* 価格記録テーブル */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        値段
                      </th>
                      <th className="min-w-[5em] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        数量
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        単価
                      </th>
                      <th className="min-w-[10em] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        店舗
                      </th>
                      <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell">
                        備考
                      </th>
                      {!readOnly && (
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          操作
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {priceRecords.map((record) => {
                      const unitPrice = calcUnitPrice(
                        record.price,
                        record.quantity
                      );
                      const isCheapest =
                        cheapestRecord && record.id === cheapestRecord.id;
                      return (
                        <tr
                          key={record.id}
                          className={clsx(
                            'hover:bg-gray-50',
                            isCheapest && 'bg-green-50'
                          )}
                        >
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              {formatPrice(record.price)}
                              {record.isOnSale && (
                                <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">
                                  セール
                                </span>
                              )}
                              {isCheapest && (
                                <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                                  最安値
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="min-w-[2em] px-4 py-3 text-sm text-gray-900">
                            {record.quantity}
                            {product.unit}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {unitPrice !== ''
                              ? `${unitPrice.toFixed(4)}/${product.unit}`
                              : '-'}
                          </td>
                          <td className="min-w-[5em] px-4 py-3 text-sm text-gray-900">
                            {record.store}
                          </td>
                          <td className="hidden px-4 py-3 text-sm text-gray-500 md:table-cell">
                            {record.notes || '-'}
                          </td>
                          {!readOnly && (
                            <td className="px-4 py-3 text-sm">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => onEditPriceRecord(record)}
                                  className="p-1 text-blue-600 hover:text-blue-800"
                                  title="編集"
                                >
                                  <FiEdit2 className="size-4" />
                                </button>
                                <button
                                  onClick={() => onDeletePriceRecord(record.id)}
                                  className="p-1 text-red-600 hover:text-red-800"
                                  title="削除"
                                >
                                  <FiTrash2 className="size-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* アクションボタン (通常モードのみ) */}
              {!readOnly && (
                <div className="flex flex-wrap justify-between gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3">
                  <div className="flex gap-2">
                    {onAddPriceRecord && (
                      <button
                        onClick={() => onAddPriceRecord(product.id)}
                        className="rounded bg-blue-600 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-700"
                      >
                        価格を追加
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {onEditProduct && (
                      <button
                        onClick={() => onEditProduct(product)}
                        className="rounded px-3 py-1 text-sm text-gray-600 transition-colors hover:text-gray-800"
                      >
                        商品を編集
                      </button>
                    )}
                    {onDeleteProduct && (
                      <button
                        onClick={() => onDeleteProduct(product.id)}
                        className="rounded px-3 py-1 text-sm text-red-600 transition-colors hover:text-red-800"
                      >
                        商品を削除
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductAccordion;
