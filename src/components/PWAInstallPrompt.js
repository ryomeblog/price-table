import React, { useState, useEffect } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // デフォルトのプロンプトを防ぐ
      e.preventDefault();
      // 後で使用するためにイベントを保存
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // インストールプロンプトを表示
    deferredPrompt.prompt();

    // ユーザーの選択を待つ
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // プロンプトを使用後はリセット
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // 24時間後に再度表示するためにlocalStorageに記録
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // 既にインストール済みかチェック
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone;

  // 24時間以内に非表示にされた場合は表示しない
  const dismissedTime = localStorage.getItem('pwa-prompt-dismissed');
  const shouldShowPrompt =
    !dismissedTime ||
    Date.now() - parseInt(dismissedTime) > 24 * 60 * 60 * 1000;

  if (!showPrompt || isStandalone || !shouldShowPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm">
      <div className="rounded-lg bg-blue-600 p-4 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center">
              <FiDownload className="mr-2 size-5" />
              <h3 className="text-sm font-semibold">アプリをインストール</h3>
            </div>
            <p className="mb-3 text-xs text-blue-100">
              底値表アプリをホーム画面に追加して、より便利にご利用いただけます。
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="rounded bg-white px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
              >
                インストール
              </button>
              <button
                onClick={handleDismiss}
                className="rounded px-3 py-1 text-xs text-blue-100 transition-colors hover:text-white"
              >
                後で
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-blue-200 hover:text-white"
          >
            <FiX className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
