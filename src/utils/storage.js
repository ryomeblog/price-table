// ストレージキー定義
export const STORAGE_KEYS = {
  PRODUCTS: 'price-table-products',
  PRICE_RECORDS: 'price-table-price-records',
  APP_SETTINGS: 'price-table-settings',
};

// ユーティリティ関数
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const formatDate = (date) => {
  return new Date(date).toISOString();
};

export const parseDate = (dateString) => {
  return new Date(dateString);
};

// ストレージ管理クラス
class StorageManager {
  /**
   * データを保存
   * @param {string} key - ストレージキー
   * @param {Array} data - 保存するデータ
   */
  async save(key, data) {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
    } catch (error) {
      console.error('データ保存エラー:', error);
      throw new Error('データの保存に失敗しました');
    }
  }

  /**
   * データを取得
   * @param {string} key - ストレージキー
   * @returns {Array} 取得したデータ
   */
  async load(key) {
    try {
      const serializedData = localStorage.getItem(key);
      if (!serializedData) {
        return [];
      }

      const data = JSON.parse(serializedData);
      // 日付フィールドを復元
      return data.map((item) => ({
        ...item,
        createdAt: parseDate(item.createdAt),
        updatedAt: parseDate(item.updatedAt),
        ...(item.purchaseDate && {
          purchaseDate: parseDate(item.purchaseDate),
        }),
      }));
    } catch (error) {
      console.error('データ読み込みエラー:', error);
      return [];
    }
  }

  /**
   * データを削除
   * @param {string} key - ストレージキー
   */
  async remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('データ削除エラー:', error);
      throw new Error('データの削除に失敗しました');
    }
  }

  /**
   * 全データをクリア
   */
  async clear() {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('データクリアエラー:', error);
      throw new Error('データのクリアに失敗しました');
    }
  }

  /**
   * 全データをJSONでエクスポート
   * @returns {string} JSON文字列
   */
  async export() {
    try {
      const exportData = {
        products: await this.load(STORAGE_KEYS.PRODUCTS),
        priceRecords: await this.load(STORAGE_KEYS.PRICE_RECORDS),
        settings: await this.load(STORAGE_KEYS.APP_SETTINGS),
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('データエクスポートエラー:', error);
      throw new Error('データのエクスポートに失敗しました');
    }
  }

  /**
   * JSONデータをインポート
   * @param {string} jsonData - JSON文字列
   */
  async import(jsonData) {
    try {
      const data = JSON.parse(jsonData);

      // データ形式の検証
      if (!data.products || !data.priceRecords) {
        throw new Error('不正なデータ形式です');
      }

      // データを保存
      await this.save(STORAGE_KEYS.PRODUCTS, data.products);
      await this.save(STORAGE_KEYS.PRICE_RECORDS, data.priceRecords);

      if (data.settings) {
        await this.save(STORAGE_KEYS.APP_SETTINGS, data.settings);
      }
    } catch (error) {
      console.error('データインポートエラー:', error);
      throw new Error('データのインポートに失敗しました: ' + error.message);
    }
  }

  /**
   * データサイズを取得（MB単位）
   * @returns {number} データサイズ
   */
  getDataSize() {
    try {
      let totalSize = 0;
      Object.values(STORAGE_KEYS).forEach((key) => {
        const data = localStorage.getItem(key);
        if (data) {
          totalSize += new Blob([data]).size;
        }
      });
      return (totalSize / 1024 / 1024).toFixed(2); // MB
    } catch (error) {
      console.error('データサイズ計算エラー:', error);
      return 0;
    }
  }
}

// シングルトンインスタンス
export const storageManager = new StorageManager();

// エンティティファクトリー関数
export const createProduct = (name, unit = '', description = '') => {
  const now = new Date();
  return {
    id: generateId(),
    name: name.trim(),
    unit: unit.trim(),
    description: description.trim(),
    createdAt: now,
    updatedAt: now,
  };
};

export const createPriceRecord = (
  productId,
  price,
  quantity,
  store,
  notes = '',
  isOnSale = false,
  purchaseDate = null
) => {
  const now = new Date();
  return {
    id: generateId(),
    productId,
    price: Number(price),
    quantity: Number(quantity),
    unitPrice: Number((price / quantity).toFixed(2)),
    store: store.trim(),
    notes: notes.trim(),
    purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
    isOnSale: Boolean(isOnSale),
    createdAt: now,
    updatedAt: now,
  };
};

export const updateEntity = (entity, updates) => {
  return {
    ...entity,
    ...updates,
    updatedAt: new Date(),
  };
};
