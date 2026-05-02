const GLOBAL_CHANNEL = "*";

const resourceDependencyMap = {
  transactions: ["transactions", "income", "expenses", "wallets", "budgets", "dashboard", "reports", "receipts", "ai-insights"],
  wallets: ["wallets", "transactions", "income", "expenses", "dashboard", "reports"],
  categories: ["categories", "transactions", "income", "expenses", "budgets", "dashboard"],
  budgets: ["budgets", "dashboard", "reports"],
  "savings-goals": ["savings-goals", "dashboard", "reports"],
  "savings-contributions": ["savings-goals", "dashboard", "reports"],
  recurring: ["recurring", "dashboard", "reports", "notifications"],
  debts: ["debts", "dashboard", "reports"],
  "debt-payments": ["debts", "dashboard", "reports"],
  notifications: ["notifications", "dashboard"],
  "ai-insights": ["ai-insights", "dashboard"],
  receipts: ["receipts", "transactions", "income", "expenses", "dashboard"],
  currencies: ["currencies", "wallets", "transactions", "income", "expenses", "dashboard", "reports", "settings", "profile"],
  groups: ["groups", "transactions", "dashboard"],
  profile: ["profile", "settings"],
  settings: ["settings", "profile", "dashboard", "reports"],
};

function getRealtimeStore() {
  if (!globalThis.__financeTrackerRealtimeStore) {
    globalThis.__financeTrackerRealtimeStore = new Map();
  }

  return globalThis.__financeTrackerRealtimeStore;
}

function getListeners(channel) {
  const store = getRealtimeStore();
  if (!store.has(channel)) {
    store.set(channel, new Set());
  }

  return store.get(channel);
}

export function subscribeToLiveEvents(channel, listener) {
  const listeners = getListeners(channel);
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      getRealtimeStore().delete(channel);
    }
  };
}

export function expandLiveResources(resource, extraResources = []) {
  return Array.from(new Set([resource, ...(resourceDependencyMap[resource] || []), ...extraResources].filter(Boolean)));
}

export function publishLiveEvent({ userId, resource, action = "updated", extraResources = [], broadcast = false, payload = {} }) {
  const event = {
    action,
    resource,
    resources: expandLiveResources(resource, extraResources),
    timestamp: new Date().toISOString(),
    ...payload,
  };

  const listeners = [
    ...Array.from(getListeners(GLOBAL_CHANNEL)),
    ...(broadcast ? [] : Array.from(getListeners(userId))),
  ];

  for (const listener of listeners) {
    listener(event);
  }

  return event;
}

export function publishGlobalLiveEvent({ resource, action = "updated", extraResources = [], payload = {} }) {
  return publishLiveEvent({
    userId: GLOBAL_CHANNEL,
    resource,
    action,
    extraResources,
    broadcast: true,
    payload,
  });
}

export { GLOBAL_CHANNEL };
