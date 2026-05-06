import { ModulePage } from "@/components/dashboard/module-page";

export default function RecurringPage() {
  return (
    <ModulePage
      title="Recurring Payments"
      description="Track recurring bills or income with next due dates and optional auto-create."
      endpoint="/api/recurring"
      columns={[
        { label: "Title", accessor: "title" },
        { label: "Type", accessor: "type" },
        { label: "Amount", accessor: "amount", format: "currency" },
        { label: "Frequency", accessor: "frequency" },
        { label: "Next Due", accessor: "nextDueDate", format: "date" },
      ]}
      fields={[
        { name: "title", label: "Title", type: "text" },
        { name: "type", label: "Type", type: "select", options: [{ value: "income", label: "Income" }, { value: "expense", label: "Expense" }] },
        { name: "amount", label: "Amount", type: "number" },
        { name: "categoryId", label: "Category", type: "select", lookupKey: "categories" },
        { name: "walletId", label: "Wallet", type: "select", lookupKey: "wallets" },
        { name: "frequency", label: "Frequency", type: "select", options: [{ value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }, { value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }] },
        { name: "startDate", label: "Start Date", type: "date" },
        { name: "endDate", label: "End Date", type: "date" },
        { name: "nextDueDate", label: "Next Due Date", type: "date" },
      ]}
      defaultValues={{ title: "", type: "expense", amount: "", categoryId: "", walletId: "", frequency: "monthly", startDate: "", endDate: "", nextDueDate: "" }}
      lookups={["categories", "wallets"]}
    />
  );
}
