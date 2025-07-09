import React, { useState } from 'react';
import { useProducts } from './hooks/useProducts';
import { usePriceRecords } from './hooks/usePriceRecords';
import { storageManager } from './utils/storage';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ProductAccordion from './components/ProductAccordion';
import Modal from './components/Modal';
import ProductForm from './components/ProductForm';
import PriceRecordForm from './components/PriceRecordForm';
import PWAInstallPrompt from './components/PWAInstallPrompt';

function App() {
  // データ管理フック
  const {
    products,
    loading: productsLoading,
    error: productsError,
    addProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
  } = useProducts();

  const {
    priceRecords,
    loading: priceRecordsLoading,
    error: priceRecordsError,
    addPriceRecord,
    updatePriceRecord,
    deletePriceRecord,
    deletePriceRecordsByProduct,
    getPriceRecordsByProduct,
    getCheapestPrice,
    getFrequentStores,
  } = usePriceRecords();

  // UI状態管理
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingPriceRecord, setEditingPriceRecord] = useState(null);
  const [selectedProductForPrice, setSelectedProductForPrice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 検索結果の取得
  const filteredProducts = searchProducts(searchTerm);

  // よく使う店舗リストの取得
  const frequentStores = getFrequentStores(10);

  // 商品追加ハンドラー
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  // 商品編集ハンドラー
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  // 商品削除ハンドラー
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('この商品と関連する価格情報をすべて削除しますか？')) {
      try {
        await deletePriceRecordsByProduct(productId);
        await deleteProduct(productId);
      } catch (error) {
        console.error('商品削除エラー:', error);
        alert('商品の削除に失敗しました');
      }
    }
  };

  // 商品フォーム送信ハンドラー
  const handleProductSubmit = async (productIdOrData, updates) => {
    try {
      setIsSubmitting(true);

      if (editingProduct) {
        // 更新
        await updateProduct(productIdOrData, updates);
      } else {
        // 新規追加
        await addProduct(productIdOrData.name, productIdOrData.description);
      }

      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('商品保存エラー:', error);
      alert('商品の保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 価格記録追加ハンドラー
  const handleAddPriceRecord = (productId) => {
    const product = products.find((p) => p.id === productId);
    setSelectedProductForPrice(product);
    setEditingPriceRecord(null);
    setIsPriceModalOpen(true);
  };

  // 価格記録編集ハンドラー
  const handleEditPriceRecord = (priceRecord) => {
    const product = products.find((p) => p.id === priceRecord.productId);
    setSelectedProductForPrice(product);
    setEditingPriceRecord(priceRecord);
    setIsPriceModalOpen(true);
  };

  // 価格記録削除ハンドラー
  const handleDeletePriceRecord = async (priceRecordId) => {
    if (window.confirm('この価格情報を削除しますか？')) {
      try {
        await deletePriceRecord(priceRecordId);
      } catch (error) {
        console.error('価格記録削除エラー:', error);
        alert('価格情報の削除に失敗しました');
      }
    }
  };

  // 価格記録フォーム送信ハンドラー
  const handlePriceRecordSubmit = async (productIdOrRecordId, data) => {
    try {
      setIsSubmitting(true);

      if (editingPriceRecord) {
        // 更新
        await updatePriceRecord(productIdOrRecordId, data);
      } else {
        // 新規追加
        await addPriceRecord(
          productIdOrRecordId,
          data.price,
          data.unit,
          data.quantity,
          data.store,
          data.notes,
          data.isOnSale,
          data.purchaseDate
        );
      }

      setIsPriceModalOpen(false);
      setEditingPriceRecord(null);
      setSelectedProductForPrice(null);
    } catch (error) {
      console.error('価格記録保存エラー:', error);
      alert('価格情報の保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // データエクスポートハンドラー
  const handleExportData = async () => {
    try {
      const jsonData = await storageManager.export();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `price-table-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('エクスポートエラー:', error);
      alert('データのエクスポートに失敗しました');
    }
  };

  // データインポートハンドラー
  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        await storageManager.import(text);
        window.location.reload(); // データ更新のためページをリロード
      } catch (error) {
        console.error('インポートエラー:', error);
        alert('データのインポートに失敗しました: ' + error.message);
      }
    };
    input.click();
  };

  // データクリアハンドラー
  const handleClearData = async () => {
    if (
      window.confirm('すべてのデータを削除しますか？この操作は取り消せません。')
    ) {
      try {
        await storageManager.clear();
        window.location.reload();
      } catch (error) {
        console.error('データクリアエラー:', error);
        alert('データのクリアに失敗しました');
      }
    }
  };

  // モーダルクローズハンドラー
  const handleCloseModal = () => {
    setIsProductModalOpen(false);
    setIsPriceModalOpen(false);
    setEditingProduct(null);
    setEditingPriceRecord(null);
    setSelectedProductForPrice(null);
  };

  // ローディング状態
  if (productsLoading || priceRecordsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー状態
  if (productsError || priceRecordsError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-red-600">
            <svg
              className="mx-auto mb-2 size-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-gray-600">
            データの読み込みに失敗しました: {productsError || priceRecordsError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <Header
        onAddProduct={handleAddProduct}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onClearData={handleClearData}
      />

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* 検索バー */}
        <div className="mb-6">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            className="mx-auto w-full max-w-md"
          />
        </div>

        {/* 商品一覧 */}
        <div className="space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-4 text-gray-400">
                <svg
                  className="mx-auto size-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                {searchTerm
                  ? '検索結果が見つかりません'
                  : '商品が登録されていません'}
              </h3>
              <p className="mb-4 text-gray-500">
                {searchTerm
                  ? '別のキーワードで検索してみてください'
                  : '最初の商品を追加して始めましょう'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleAddProduct}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  商品を追加
                </button>
              )}
            </div>
          ) : (
            filteredProducts.map((product) => (
              <ProductAccordion
                key={product.id}
                product={product}
                priceRecords={getPriceRecordsByProduct(product.id)}
                cheapestPrice={getCheapestPrice(product.id)}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onEditPriceRecord={handleEditPriceRecord}
                onDeletePriceRecord={handleDeletePriceRecord}
                onAddPriceRecord={handleAddPriceRecord}
              />
            ))
          )}
        </div>
      </main>

      {/* 商品フォームモーダル */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? '商品編集' : '商品追加'}
      >
        <ProductForm
          initialData={editingProduct}
          onSubmit={handleProductSubmit}
          onCancel={handleCloseModal}
          isSubmitting={isSubmitting}
          existingProducts={products}
        />
      </Modal>

      {/* 価格記録フォームモーダル */}
      <Modal
        isOpen={isPriceModalOpen}
        onClose={handleCloseModal}
        title={editingPriceRecord ? '価格情報編集' : '価格情報追加'}
        size="lg"
      >
        <PriceRecordForm
          initialData={editingPriceRecord}
          productId={selectedProductForPrice?.id}
          productName={selectedProductForPrice?.name}
          frequentStores={frequentStores}
          onSubmit={handlePriceRecordSubmit}
          onCancel={handleCloseModal}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* PWAインストールプロンプト */}
      <PWAInstallPrompt />
    </div>
  );
}

export default App;
