import { useState, useEffect, useMemo, useRef } from 'react';
import {
  storageManager,
  STORAGE_KEYS,
  createShoppingList,
  createShoppingListItem,
  updateEntity,
} from '../utils/storage';

/**
 * 買い物リストとアイテムを管理するフック
 *
 * - ShoppingList   : リスト(グループ)
 * - ShoppingListItem: リスト内アイテム (productId を参照)
 *
 * 「買った」操作は物理削除（論理削除ではない）。
 *
 * 実装ノート:
 *   複数の async ミューテーション(addShoppingList → setListItems → updateShoppingList ...)
 *   を 1 イベント内で連鎖して呼ぶケースがあるため、クロージャでキャプチャされた
 *   state を直接参照すると古い値で上書きしてしまう。
 *   そのため最新の配列を useRef で同期保持し、ミューテーションは ref から読む。
 */
export const useShoppingLists = () => {
  const [shoppingLists, setShoppingLists] = useState([]);
  const [shoppingListItems, setShoppingListItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 最新値を同期参照するための ref
  const listsRef = useRef([]);
  const itemsRef = useRef([]);

  const commitLists = (next) => {
    listsRef.current = next;
    setShoppingLists(next);
  };
  const commitItems = (next) => {
    itemsRef.current = next;
    setShoppingListItems(next);
  };

  // 初期ロード
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [lists, items] = await Promise.all([
          storageManager.load(STORAGE_KEYS.SHOPPING_LISTS),
          storageManager.load(STORAGE_KEYS.SHOPPING_LIST_ITEMS),
        ]);
        commitLists(lists);
        commitItems(items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 保存ヘルパ
  const saveLists = async (data) => {
    try {
      await storageManager.save(STORAGE_KEYS.SHOPPING_LISTS, data);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  const saveItems = async (data) => {
    try {
      await storageManager.save(STORAGE_KEYS.SHOPPING_LIST_ITEMS, data);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // ───────── ShoppingList CRUD ─────────

  const addShoppingList = async (name, description = '') => {
    try {
      const newList = createShoppingList(name, description);
      const next = [...listsRef.current, newList];
      commitLists(next);
      await saveLists(next);
      return newList;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateShoppingList = async (id, updates) => {
    try {
      const next = listsRef.current.map((list) =>
        list.id === id ? updateEntity(list, updates) : list
      );
      commitLists(next);
      await saveLists(next);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // リスト削除 + 紐づくアイテムを全削除（カスケード）
  const deleteShoppingList = async (id) => {
    try {
      const nextLists = listsRef.current.filter((list) => list.id !== id);
      const nextItems = itemsRef.current.filter((item) => item.listId !== id);
      commitLists(nextLists);
      commitItems(nextItems);
      await saveLists(nextLists);
      await saveItems(nextItems);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // ───────── ShoppingListItem 操作 ─────────

  const addItemToList = async (listId, productId) => {
    try {
      const exists = itemsRef.current.some(
        (item) => item.listId === listId && item.productId === productId
      );
      if (exists) return null;

      const newItem = createShoppingListItem(listId, productId);
      const next = [...itemsRef.current, newItem];
      commitItems(next);
      await saveItems(next);
      await updateShoppingList(listId, {});
      return newItem;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // チェック状態をトグル（「買った」マーク、物理削除はしない）
  const toggleItemChecked = async (itemId) => {
    try {
      let targetListId = null;
      const next = itemsRef.current.map((item) => {
        if (item.id === itemId) {
          targetListId = item.listId;
          return { ...item, checked: !item.checked };
        }
        return item;
      });
      commitItems(next);
      await saveItems(next);
      if (targetListId) await updateShoppingList(targetListId, {});
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 物理削除 ("買った" の旧仕様。商品行のチェックでは使わないが API として残す)
  const removeItemFromList = async (itemId) => {
    try {
      const target = itemsRef.current.find((i) => i.id === itemId);
      const next = itemsRef.current.filter((item) => item.id !== itemId);
      commitItems(next);
      await saveItems(next);
      if (target) await updateShoppingList(target.listId, {});
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * フォーム保存用：現在の productIds 配列との差分を取り、
   * 不足分を add / 余剰分を remove してアトミックに反映する。
   */
  const setListItems = async (listId, productIds) => {
    try {
      const desired = new Set(productIds);
      const currentItems = itemsRef.current.filter(
        (item) => item.listId === listId
      );
      const currentProductIds = new Set(currentItems.map((i) => i.productId));

      const toAdd = [...desired]
        .filter((pid) => !currentProductIds.has(pid))
        .map((pid) => createShoppingListItem(listId, pid));

      const removeIds = new Set(
        currentItems.filter((i) => !desired.has(i.productId)).map((i) => i.id)
      );

      const next = [
        ...itemsRef.current.filter((i) => !removeIds.has(i.id)),
        ...toAdd,
      ];
      commitItems(next);
      await saveItems(next);
      // 親リストの updatedAt を更新（新規作成直後でも安全 — ref から最新を読むため）
      await updateShoppingList(listId, {});
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 商品削除カスケード用
  const deleteShoppingListItemsByProduct = async (productId) => {
    try {
      const next = itemsRef.current.filter(
        (item) => item.productId !== productId
      );
      if (next.length === itemsRef.current.length) return;
      commitItems(next);
      await saveItems(next);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // ───────── 取得系 (useMemo) ─────────

  const getItemsByList = useMemo(() => {
    return (listId) =>
      shoppingListItems.filter((item) => item.listId === listId);
  }, [shoppingListItems]);

  const getProductIdsByList = useMemo(() => {
    return (listId) =>
      shoppingListItems
        .filter((item) => item.listId === listId)
        .map((item) => item.productId);
  }, [shoppingListItems]);

  const getListSummary = useMemo(() => {
    return (listId) => ({
      total: shoppingListItems.filter((item) => item.listId === listId).length,
    });
  }, [shoppingListItems]);

  const getShoppingList = (id) => shoppingLists.find((list) => list.id === id);

  return {
    shoppingLists,
    shoppingListItems,
    loading,
    error,
    // List
    addShoppingList,
    updateShoppingList,
    deleteShoppingList,
    getShoppingList,
    // Item
    addItemToList,
    removeItemFromList,
    toggleItemChecked,
    setListItems,
    deleteShoppingListItemsByProduct,
    // Query
    getItemsByList,
    getProductIdsByList,
    getListSummary,
    setError,
  };
};
