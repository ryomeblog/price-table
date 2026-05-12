import React, { useState, useMemo, useEffect } from 'react';
import { FiChevronLeft, FiSave } from 'react-icons/fi';
import clsx from 'clsx';
import SearchBar from './SearchBar';
import ProductAccordion from './ProductAccordion';
import { filterProducts } from '../utils/productFilter';

const ShoppingListForm = ({
  initialList = null, // 編集対象 (null で新規)
  initialSelectedIds = [],
  products,
  priceRecords,
  getPriceRecordsByProduct,
  onSave,
  onCancel,
  isSubmitting = false,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState('product');
  const [showCheapestOnly, setShowCheapestOnly] = useState(false);
  const [errors, setErrors] = useState({});

  // 初期値設定
  useEffect(() => {
    if (initialList) {
      setName(initialList.name || '');
      setDescription(initialList.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setSelectedIds(new Set(initialSelectedIds));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialList]);

  const filteredProducts = useMemo(
    () =>
      filterProducts({
        products,
        priceRecords,
        searchTerm,
        searchMode,
        showCheapestOnly,
      }),
    [products, priceRecords, searchTerm, searchMode, showCheapestOnly]
  );

  const handleSelectChange = (productId, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(productId);
      else next.delete(productId);
      return next;
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'リスト名を入力してください';
    } else if (name.trim().length > 50) {
      newErrors.name = 'リスト名は50文字以内で入力してください';
    }
    if (description && description.length > 200) {
      newErrors.description = 'メモは200文字以内で入力してください';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      productIds: [...selectedIds],
    });
  };

  // Ctrl+Enter で保存
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, description, selectedIds]);

  return (
    <div>
      {/* サブヘッダー */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <FiChevronLeft className="size-4" />
            キャンセル
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            {initialList ? '買い物リストを編集' : '買い物リストを作成'}
          </h2>
        </div>
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          <FiSave className="size-4" />
          {isSubmitting ? '保存中...' : '保存'}
        </button>
      </div>

      {/* リスト情報 */}
      <div className="mb-6 space-y-4 rounded-lg border border-gray-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            リスト名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={clsx(
              'block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1',
              errors.name
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            )}
            placeholder="例: 今週末の買い物"
            maxLength={60}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            メモ
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={clsx(
              'block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1',
              errors.description
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            )}
            placeholder="例: 週末のまとめ買い用"
            maxLength={220}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">{errors.description}</p>
          )}
        </div>
      </div>

      {/* 商品ピッカー */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h3 className="text-lg font-semibold text-gray-900">商品を選択</h3>
        <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white">
          {selectedIds.size} 件選択中
        </span>
      </div>

      <div className="mb-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          mode={searchMode}
          onModeChange={setSearchMode}
          showCheapestOnly={showCheapestOnly}
          onShowCheapestOnly={setShowCheapestOnly}
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white py-8 text-center text-gray-500">
          {products.length === 0
            ? '商品が登録されていません。先に底値表で商品を登録してください。'
            : '検索条件に一致する商品がありません'}
        </div>
      ) : (
        <div>
          {filteredProducts.map((product) => (
            <ProductAccordion
              key={product.id}
              product={product}
              priceRecords={getPriceRecordsByProduct(product.id)}
              selectable
              selected={selectedIds.has(product.id)}
              onSelectChange={handleSelectChange}
              readOnly
            />
          ))}
        </div>
      )}

      {/* 下部アクションボタン */}
      <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSubmitting}
          className="rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {isSubmitting ? '保存中...' : '保存'}
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Ctrl+Enter: 保存 /
        商品左のチェックで選択・解除。アコーディオンを展開すると価格情報を確認できます。
      </div>
    </div>
  );
};

export default ShoppingListForm;
