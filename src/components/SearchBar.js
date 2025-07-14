import React from 'react';
import { FiSearch } from 'react-icons/fi';
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
        <button
          type="button"
          onClick={() => onShowCheapestOnly(!showCheapestOnly)}
          className={clsx(
            'relative ml-2 flex items-center rounded-full px-3 py-1 text-sm font-medium transition',
            showCheapestOnly
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          )}
          aria-pressed={showCheapestOnly}
        >
          <span className="mr-2">最安値フィルター</span>
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
      )}
    </div>
  );
};

export default SearchBar;
