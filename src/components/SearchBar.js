import React from 'react';
import { FiSearch } from 'react-icons/fi';
import clsx from 'clsx';

const SearchBar = ({
  value,
  onChange,
  placeholder = '商品名で検索...',
  className,
}) => {
  return (
    <div className={clsx('relative w-full max-w-md', className)}>
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
  );
};

export default SearchBar;
