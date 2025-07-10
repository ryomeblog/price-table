import { useState, useEffect, useMemo } from 'react';
import {
  storageManager,
  STORAGE_KEYS,
  createProduct,
  updateEntity,
} from '../utils/storage';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 商品データの読み込み
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await storageManager.load(STORAGE_KEYS.PRODUCTS);
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // 商品データの保存
  const saveProducts = async (productData) => {
    try {
      await storageManager.save(STORAGE_KEYS.PRODUCTS, productData);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 商品の追加
  const addProduct = async (name, unit = '', description = '') => {
    try {
      const newProduct = createProduct(name, unit, description);
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      await saveProducts(updatedProducts);
      return newProduct;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 商品の更新
  const updateProduct = async (id, updates) => {
    try {
      const updatedProducts = products.map((product) =>
        product.id === id ? updateEntity(product, updates) : product
      );
      setProducts(updatedProducts);
      await saveProducts(updatedProducts);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 商品の削除
  const deleteProduct = async (id) => {
    try {
      const updatedProducts = products.filter((product) => product.id !== id);
      setProducts(updatedProducts);
      await saveProducts(updatedProducts);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 商品の検索
  const searchProducts = useMemo(() => {
    return (keyword) => {
      if (!keyword) return products;
      return products.filter((product) =>
        product.name.toLowerCase().includes(keyword.toLowerCase())
      );
    };
  }, [products]);

  // 商品の取得
  const getProduct = (id) => {
    return products.find((product) => product.id === id);
  };

  // 商品の存在確認
  const productExists = (name) => {
    return products.some((product) => product.name === name);
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getProduct,
    productExists,
    setError,
  };
};
