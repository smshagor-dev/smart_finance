import { ModulePage } from "@/components/dashboard/module-page";

export default function ExpensesPage() {
  return (
    <ModulePage
      title="Expenses"
      description="Track spending with category and wallet level visibility."
      endpoint="/api/transactions"
      columns={[
        { label: "Amount", accessor: "originalAmount", format: "currency", currencyAccessor: "currency.code" },
        { label: "Category", accessor: "category.name" },
        { label: "Wallet", accessor: "wallet.name" },
        { label: "Method", accessor: "paymentMethod" },
        { label: "Date", accessor: "transactionDate", format: "date" },
      ]}
      fields={[
        { name: "type", label: "Type", type: "select", options: [{ value: "expense", label: "Expense" }] },
        { name: "amount", label: "Amount", type: "number" },
        { name: "categoryId", label: "Category", type: "select", lookupKey: "expenseCategories" },
        { name: "walletId", label: "Wallet", type: "select", lookupKey: "wallets" },
        { name: "groupId", label: "Group", type: "select", lookupKey: "groups" },
        { name: "currencyId", label: "Currency", type: "select", lookupKey: "currencies" },
        { name: "paymentMethod", label: "Payment Method", type: "text" },
        { name: "transactionDate", label: "Expense Date", type: "date" },
        { name: "attachmentUrl", label: "Attachment", type: "file-upload", fullWidth: true, uploadLabel: "Upload attachment" },
        { name: "note", label: "Note", type: "textarea", fullWidth: true },
      ]}
      defaultValues={{ type: "expense", amount: "", categoryId: "", walletId: "", groupId: "", currencyId: "", paymentMethod: "", transactionDate: "", attachmentUrl: "", note: "" }}
      lookups={["expenseCategories", "wallets", "groups", "currencies"]}
      baseFilters={{ type: "expense" }}
      filterFields={[
        { name: "categoryId", label: "Category", type: "select", lookupKey: "expenseCategories" },
        { name: "walletId", label: "Wallet", type: "select", lookupKey: "wallets" },
        { name: "groupId", label: "Group", type: "select", lookupKey: "groups" },
        { name: "from", label: "From", type: "date" },
        { name: "to", label: "To", type: "date" },
      ]}
    />
  );
}
