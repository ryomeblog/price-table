/**
 * 商品の検索／フィルタリング共通ロジック
 *
 * 底値表画面と買い物リスト追加・編集画面の両方から利用される。
 */

/**
 * 単価を計算（小数第5位以下切り捨て）
 */
const calcUnitPrice = (price, quantity) => {
  if (
    !price ||
    !quantity ||
    isNaN(price) ||
    isNaN(quantity) ||
    Number(quantity) === 0
  ) {
    return Infinity;
  }
  return Number(price) / Number(quantity);
};

/**
 * 商品をフィルタする
 *
 * @param {Object} params
 * @param {Array}   params.products       - 商品一覧
 * @param {Array}   params.priceRecords   - 価格記録一覧
 * @param {string}  params.searchTerm     - 検索キーワード
 * @param {string}  params.searchMode     - 'product' | 'store'
 * @param {boolean} params.showCheapestOnly - store モード時の最安値フィルタ
 * @returns {Array} フィルタ後の商品配列
 */
export const filterProducts = ({
  products,
  priceRecords,
  searchTerm,
  searchMode,
  showCheapestOnly,
}) => {
  if (searchMode === 'product') {
    if (!searchTerm) return products;
    const kw = searchTerm.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(kw));
  }

  if (searchMode === 'store') {
    let result = products.filter((product) => {
      const records = priceRecords.filter((r) => r.productId === product.id);
      if (!searchTerm) return records.length > 0;
      return records.some((rec) => rec.store && rec.store.includes(searchTerm));
    });

    if (showCheapestOnly && searchTerm) {
      result = result.filter((product) => {
        const records = priceRecords.filter((r) => r.productId === product.id);
        const cheapest = records.reduce((minRec, rec) => {
          const unit = calcUnitPrice(rec.price, rec.quantity);
          if (!minRec) return rec;
          const minUnit = calcUnitPrice(minRec.price, minRec.quantity);
          return unit < minUnit ? rec : minRec;
        }, null);
        return (
          cheapest && cheapest.store && cheapest.store.includes(searchTerm)
        );
      });
    }
    return result;
  }

  return products;
};
