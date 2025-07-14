import React, { useEffect, useState } from 'react';
import { FiSearch, FiInfo } from 'react-icons/fi';
import clsx from 'clsx';

const SearchBar = ({
  value,
  onChange,
  placeholder = '商品名で検索...',
  className,
  mode = 'product', // 'product' or 'store'
  onModeChange,
  showCheapestOnly = false,
  onShowCheapestOnly,
}) => {
  const [showInfo, setShowInfo] = useState(false);

  // ポップオーバー外クリックで閉じる
  useEffect(() => {
    if (!showInfo) return;
    const handler = (e) => {
      if (
        !document.getElementById('cheapest-info-popover')?.contains(e.target)
      ) {
        setShowInfo(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showInfo]);

  return (
    <div
      className={clsx('flex w-full max-w-2xl items-center gap-2', className)}
    >
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <FiSearch className="size-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:placeholder:text-gray-400 sm:text-sm"
        />
      </div>
      <select
        value={mode}
        onChange={(e) => onModeChange && onModeChange(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        style={{ minWidth: 100 }}
      >
        <option value="product">商品名</option>
        <option value="store">店舗</option>
      </select>
      {mode === 'store' && onShowCheapestOnly && (
        <div className="relative ml-2 flex items-center">
          <button
            type="button"
            onClick={() => setShowInfo((v) => !v)}
            className={clsx(
              'mr-2 flex size-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 transition hover:bg-blue-200',
              showInfo && 'ring-2 ring-blue-400'
            )}
            aria-label="最安値フィルターの説明"
            tabIndex={0}
          >
            <FiInfo className="size-4" />
          </button>
          {showInfo && (
            <div
              id="cheapest-info-popover"
              className="absolute left-0 top-8 z-20 w-full max-w-xs rounded border border-gray-200 bg-white p-3 text-xs text-gray-700 shadow-lg sm:left-8 sm:top-1 sm:w-56"
            >
              チェックをONにすると、検索した店舗が最安値となっている商品のみ表示されます。
            </div>
          )}
          <button
            type="button"
            onClick={() => onShowCheapestOnly(!showCheapestOnly)}
            className="relative flex items-center focus:outline-none"
            aria-pressed={showCheapestOnly}
            tabIndex={0}
          >
            <span
              className={clsx(
                'relative inline-block h-5 w-10 overflow-hidden rounded-full align-middle transition-colors duration-200',
                showCheapestOnly ? 'bg-blue-500' : 'bg-gray-400'
              )}
            >
              <span
                className={clsx(
                  'absolute left-0 top-0 size-5 rounded-full bg-white shadow transition-transform duration-200',
                  showCheapestOnly ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
