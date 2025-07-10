import React, { useState, useEffect } from 'react';
import { FiCalendar, FiChevronDown } from 'react-icons/fi';
import clsx from 'clsx';

const PriceRecordForm = ({
  initialData = null,
  productId,
  productName,
  unit,
  frequentStores = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    price: '',
    quantity: '',
    store: '',
    notes: '',
    isOnSale: false,
    purchaseDate: '',
  });

  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [errors, setErrors] = useState({});

  // 初期データの設定
  useEffect(() => {
    if (initialData) {
      setFormData({
        price: initialData.price?.toString() || '',
        quantity: initialData.quantity?.toString() || '',
        store: initialData.store || '',
        notes: initialData.notes || '',
        isOnSale: initialData.isOnSale || false,
        purchaseDate: initialData.purchaseDate
          ? new Date(initialData.purchaseDate).toISOString().split('T')[0]
          : '',
      });
    }
  }, [initialData]);

  // 単価の自動計算
  const unitPrice =
    formData.price && formData.quantity
      ? (parseFloat(formData.price) / parseFloat(formData.quantity)).toFixed(2)
      : '';

  // フォームデータの更新
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // エラーをクリア
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // バリデーション
  const validateForm = () => {
    const newErrors = {};

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = '価格を正しく入力してください';
    }

    // 単位のバリデーションは不要（商品側で管理）

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = '数量を正しく入力してください';
    }

    if (!formData.store.trim()) {
      newErrors.store = '店舗名を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム送信
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseFloat(formData.quantity),
      purchaseDate: formData.purchaseDate
        ? new Date(formData.purchaseDate)
        : null,
    };

    if (initialData) {
      onSubmit(initialData.id, submitData);
    } else {
      onSubmit(productId, submitData);
    }
  };

  // 店舗選択
  const handleStoreSelect = (storeName) => {
    handleInputChange('store', storeName);
    setShowStoreDropdown(false);
  };

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit(e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [formData]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 商品名表示 */}
      {productName && (
        <div className="rounded-lg bg-blue-50 p-3">
          <h3 className="font-medium text-blue-900">商品: {productName}</h3>
        </div>
      )}

      {/* 価格・数量・単価の行 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {/* 価格 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            価格 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className={clsx(
                'block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1',
                errors.price
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              )}
              placeholder="298"
            />
            <span className="absolute right-3 top-2 text-sm text-gray-500">
              円
            </span>
          </div>
          {errors.price && (
            <p className="mt-1 text-xs text-red-600">{errors.price}</p>
          )}
        </div>

        {/* 商品単位（表示のみ） */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            単位
          </label>
          <div className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900">
            {unit ? unit : '-'}
          </div>
        </div>

        {/* 数量 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            数量 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', e.target.value)}
            className={clsx(
              'block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1',
              errors.quantity
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            )}
            placeholder="5"
          />
          {errors.quantity && (
            <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>
          )}
        </div>

        {/* 単価（自動計算） */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            単価（自動計算）
          </label>
          <div className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900">
            {unitPrice ? `${unitPrice}円` : '-'}
          </div>
        </div>
      </div>

      {/* 店舗名 */}
      <div className="relative">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          購入場所 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.store}
            onChange={(e) => handleInputChange('store', e.target.value)}
            onFocus={() => setShowStoreDropdown(true)}
            onBlur={() => setTimeout(() => setShowStoreDropdown(false), 200)}
            className={clsx(
              'block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1',
              errors.store
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            )}
            placeholder="例：イオン○○店、業務スーパー"
          />

          {/* よく使う店舗のドロップダウン */}
          {showStoreDropdown && frequentStores.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
              <div className="py-1">
                <div className="bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500">
                  よく使う店舗
                </div>
                {frequentStores.slice(0, 5).map((store, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleStoreSelect(store)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                  >
                    {store}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {errors.store && (
          <p className="mt-1 text-xs text-red-600">{errors.store}</p>
        )}
      </div>

      {/* 備考・購入日・セールフラグ */}
      <div className="space-y-4">
        {/* 備考 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            備考
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="例：セール中、タイムセール、会員価格など"
          />
        </div>

        {/* 購入日とセールフラグ */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              購入日
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) =>
                  handleInputChange('purchaseDate', e.target.value)
                }
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <FiCalendar className="absolute right-3 top-2.5 size-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              セール情報
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isOnSale"
                checked={formData.isOnSale}
                onChange={(e) =>
                  handleInputChange('isOnSale', e.target.checked)
                }
                className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isOnSale" className="ml-2 text-sm text-gray-700">
                セール中
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 必須項目の注意 */}
      <div className="text-xs text-red-600">* 必須項目</div>

      {/* アクションボタン */}
      <div className="flex flex-col justify-end gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? '保存中...' : initialData ? '更新' : '登録'}
        </button>
      </div>

      {/* キーボードショートカットヘルプ */}
      <div className="mt-2 text-xs text-gray-500">
        Ctrl+Enter: 登録 / Esc: キャンセル
      </div>
    </form>
  );
};

export default PriceRecordForm;
