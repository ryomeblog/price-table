import { useState, useEffect, useMemo } from 'react';
import {
  storageManager,
  STORAGE_KEYS,
  createPriceRecord,
  updateEntity,
} from '../utils/storage';

export const usePriceRecords = () => {
  const [priceRecords, setPriceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 価格記録データの読み込み
  useEffect(() => {
    const loadPriceRecords = async () => {
      try {
        setLoading(true);
        const data = await storageManager.load(STORAGE_KEYS.PRICE_RECORDS);
        setPriceRecords(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPriceRecords();
  }, []);

  // 価格記録データの保存
  const savePriceRecords = async (recordData) => {
    try {
      await storageManager.save(STORAGE_KEYS.PRICE_RECORDS, recordData);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 価格記録の追加
  const addPriceRecord = async (
    productId,
    price,
    quantity,
    store,
    notes = '',
    isOnSale = false,
    purchaseDate = null
  ) => {
    try {
      const newRecord = createPriceRecord(
        productId,
        price,
        quantity,
        store,
        notes,
        isOnSale,
        purchaseDate
      );
      const updatedRecords = [...priceRecords, newRecord];
      setPriceRecords(updatedRecords);
      await savePriceRecords(updatedRecords);
      return newRecord;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 価格記録の更新
  const updatePriceRecord = async (id, updates) => {
    try {
      const updatedRecords = priceRecords.map((record) => {
        if (record.id === id) {
          const updated = updateEntity(record, updates);
          // 単価を再計算
          if (updates.price !== undefined || updates.quantity !== undefined) {
            updated.unitPrice = Number(
              (updated.price / updated.quantity).toFixed(2)
            );
          }
          return updated;
        }
        return record;
      });
      setPriceRecords(updatedRecords);
      await savePriceRecords(updatedRecords);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 価格記録の削除
  const deletePriceRecord = async (id) => {
    try {
      const updatedRecords = priceRecords.filter((record) => record.id !== id);
      setPriceRecords(updatedRecords);
      await savePriceRecords(updatedRecords);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 商品別価格記録の取得
  const getPriceRecordsByProduct = useMemo(() => {
    return (productId) => {
      return priceRecords.filter((record) => record.productId === productId);
    };
  }, [priceRecords]);

  // 店舗別価格記録の取得
  const getPriceRecordsByStore = useMemo(() => {
    return (storeName) => {
      return priceRecords.filter((record) => record.store === storeName);
    };
  }, [priceRecords]);

  // 商品の最安値記録を取得
  const getCheapestPrice = useMemo(() => {
    return (productId) => {
      const productRecords = priceRecords.filter(
        (record) => record.productId === productId
      );
      if (productRecords.length === 0) return null;

      return productRecords.reduce((cheapest, current) => {
        return current.unitPrice < cheapest.unitPrice ? current : cheapest;
      });
    };
  }, [priceRecords]);

  // 商品の価格履歴を取得（日付降順）
  const getPriceHistory = useMemo(() => {
    return (productId, limit = null) => {
      const productRecords = priceRecords
        .filter((record) => record.productId === productId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return limit ? productRecords.slice(0, limit) : productRecords;
    };
  }, [priceRecords]);

  // よく使う店舗を取得
  const getFrequentStores = useMemo(() => {
    return (limit = 10) => {
      const storeCount = {};
      priceRecords.forEach((record) => {
        storeCount[record.store] = (storeCount[record.store] || 0) + 1;
      });

      return Object.entries(storeCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([store]) => store);
    };
  }, [priceRecords]);

  // 商品の価格記録を削除（商品削除時に使用）
  const deletePriceRecordsByProduct = async (productId) => {
    try {
      const updatedRecords = priceRecords.filter(
        (record) => record.productId !== productId
      );
      setPriceRecords(updatedRecords);
      await savePriceRecords(updatedRecords);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 価格記録の取得
  const getPriceRecord = (id) => {
    return priceRecords.find((record) => record.id === id);
  };

  return {
    priceRecords,
    loading,
    error,
    addPriceRecord,
    updatePriceRecord,
    deletePriceRecord,
    deletePriceRecordsByProduct,
    getPriceRecordsByProduct,
    getPriceRecordsByStore,
    getCheapestPrice,
    getPriceHistory,
    getFrequentStores,
    getPriceRecord,
    setError,
  };
};
