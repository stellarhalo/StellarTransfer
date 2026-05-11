export type NotificationHistoryItem = {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message: string;
  createdAt: string;
};

const storageKey = "stellartransfer.notifications";
const eventName = "stellartransfer-notifications-updated";

const canUseStorage = () =>
  typeof window !== "undefined" && window.localStorage;

const list = (): NotificationHistoryItem[] => {
  if (!canUseStorage()) return [];

  try {
    return JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
  } catch {
    return [];
  }
};

const save = (items: NotificationHistoryItem[]) => {
  if (!canUseStorage()) return;

  window.localStorage.setItem(storageKey, JSON.stringify(items.slice(0, 50)));
  window.dispatchEvent(new Event(eventName));
};

const add = (item: Omit<NotificationHistoryItem, "id" | "createdAt">) => {
  save([
    {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
    },
    ...list(),
  ]);
};

const clear = () => save([]);

const notificationHistory = {
  add,
  clear,
  eventName,
  list,
};

export default notificationHistory;
