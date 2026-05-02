import { ModulePage } from "@/components/dashboard/module-page";

export default function BudgetsPage() {
  return (
    <ModulePage
      title="Budgets"
      description="Plan monthly and category-wise budgets with warning thresholds."
      endpoint="/api/budgets"
      columns={[
        { label: "Category", accessor: "category.name" },
        { label: "Amount", accessor: "amount", format: "currency" },
        { label: "Month", accessor: "month" },
        { label: "Year", accessor: "year" },
        { label: "Status", accessor: "status" },
      ]}
      fields={[
        { name: "categoryId", label: "Category", type: "select", lookupKey: "expenseCategories" },
        { name: "walletId", label: "Wallet", type: "select", lookupKey: "wallets" },
        { name: "amount", label: "Amount", type: "number" },
        { name: "month", label: "Month", type: "number" },
        { name: "year", label: "Year", type: "number" },
        { name: "startDate", label: "Start Date", type: "date" },
        { name: "endDate", label: "End Date", type: "date" },
        { name: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "exceeded", label: "Exceeded" }, { value: "completed", label: "Completed" }] },
      ]}
      defaultValues={{ categoryId: "", walletId: "", amount: "", month: new Date().getMonth() + 1, year: new Date().getFullYear(), startDate: "", endDate: "", status: "active" }}
      lookups={["expenseCategories", "wallets"]}
    />
  );
}
