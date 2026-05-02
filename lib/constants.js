export const APP_NAME = "Finance Tracker";
export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "bn", label: "Bengali" },
  { value: "ru", label: "Russian" },
];

export const CURRENCIES = ["USD", "BDT", "EUR", "RUB"];

export const SIDEBAR_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/transactions", label: "Transactions" },
  { href: "/dashboard/income", label: "Income" },
  { href: "/dashboard/expenses", label: "Expenses" },
  { href: "/dashboard/categories", label: "Categories" },
  { href: "/dashboard/budgets", label: "Budgets" },
  { href: "/dashboard/wallets", label: "Wallets" },
  { href: "/dashboard/savings-goals", label: "Savings Goals" },
  { href: "/dashboard/recurring", label: "Recurring" },
  { href: "/dashboard/debts", label: "Debts" },
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/notifications", label: "Notifications" },
  { href: "/dashboard/ai-insights", label: "AI Insights" },
  { href: "/dashboard/receipts", label: "Receipts" },
  { href: "/dashboard/currencies", label: "Currencies" },
  { href: "/dashboard/groups", label: "Groups" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/dashboard/profile", label: "Profile" },
];

export const ADMIN_PANEL_ITEMS = [
  { href: "/dashboard/admin", label: "Overview" },
  { href: "/dashboard/admin/users", label: "Users" },
  { href: "/dashboard/admin/activity", label: "Activity" },
  { href: "/dashboard/admin/site-settings", label: "Site Settings" },
];
