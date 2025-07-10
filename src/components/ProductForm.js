import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

const ProductForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
  existingProducts = [],
}) => {
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  // 初期データの設定
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        unit: initialData.unit || '',
        description: initialData.description || '',
      });
    }
  }, [initialData]);

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

    if (!formData.name.trim()) {
      newErrors.name = '商品名を入力してください';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = '商品名は100文字以内で入力してください';
    } else {
      // 既存商品名との重複チェック（編集時は自分自身を除外）
      const isDuplicate = existingProducts.some(
        (product) =>
          product.name === formData.name.trim() &&
          (!initialData || product.id !== initialData.id)
      );

      if (isDuplicate) {
        newErrors.name = 'この商品名は既に登録されています';
      }
    }

    if (!formData.unit.trim()) {
      newErrors.unit = '単位を入力してください';
    }
    if (formData.unit && formData.unit.length > 20) {
      newErrors.unit = '単位は20文字以内で入力してください';
    }
    if (formData.description && formData.description.length > 500) {
      newErrors.description = '商品説明は500文字以内で入力してください';
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
      name: formData.name.trim(),
      unit: formData.unit.trim(),
      description: formData.description.trim(),
    };

    if (initialData) {
      onSubmit(initialData.id, submitData);
    } else {
      onSubmit(submitData);
    }
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
      {/* 商品名 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          商品名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={clsx(
            'block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1',
            errors.name
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          )}
          placeholder="例：コシヒカリ 5kg"
          maxLength={100}
        />
        <div className="mt-1 flex justify-between">
          {errors.name ? (
            <p className="text-xs text-red-600">{errors.name}</p>
          ) : (
            <p className="text-xs text-gray-500">
              商品の名前を入力してください
            </p>
          )}
          <span className="text-xs text-gray-400">
            {formData.name.length}/100
          </span>
        </div>
      </div>

      {/* 単位 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          単位 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.unit}
          onChange={(e) => handleInputChange('unit', e.target.value)}
          className={clsx(
            'block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1',
            errors.unit
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          )}
          placeholder="例：kg, 本, 袋"
          maxLength={20}
        />
        <div className="mt-1 flex justify-between">
          {errors.unit ? (
            <p className="text-xs text-red-600">{errors.unit}</p>
          ) : (
            <p className="text-xs text-gray-500">
              商品の単位を入力してください（例：kg, 本, 袋）
            </p>
          )}
          <span className="text-xs text-gray-400">
            {formData.unit.length}/20
          </span>
        </div>
      </div>

      {/* 商品説明 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          商品説明
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className={clsx(
            'block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1',
            errors.description
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          )}
          placeholder="商品の詳細説明（任意）"
          maxLength={500}
        />
        <div className="mt-1 flex justify-between">
          {errors.description ? (
            <p className="text-xs text-red-600">{errors.description}</p>
          ) : (
            <p className="text-xs text-gray-500">
              商品の詳細情報があれば入力してください
            </p>
          )}
          <span className="text-xs text-gray-400">
            {formData.description.length}/500
          </span>
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
          className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
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

export default ProductForm;
