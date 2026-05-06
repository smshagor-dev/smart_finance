import { ModulePage } from "@/components/dashboard/module-page";

export default function TransactionsPage() {
  return (
    <ModulePage
      title="Transactions"
      description="Unified transaction history with pagination, search, filtering, and editing."
      endpoint="/api/transactions"
      columns={[
        { label: "Type", accessor: "type" },
        { label: "Amount", accessor: "originalAmount", format: "currency", currencyAccessor: "currency.code" },
        { label: "Category", accessor: "category.name" },
        { label: "Wallet", accessor: "wallet.name" },
        { label: "Date", accessor: "transactionDate", format: "date" },
      ]}
      fields={[
        { name: "type", label: "Type", type: "select", options: [{ value: "income", label: "Income" }, { value: "expense", label: "Expense" }, { value: "transfer", label: "Transfer" }] },
        { name: "amount", label: "Amount", type: "number" },
        { name: "categoryId", label: "Category", type: "select", lookupKey: "categories" },
        { name: "walletId", label: "Wallet", type: "select", lookupKey: "wallets" },
        { name: "groupId", label: "Group", type: "select", lookupKey: "groups" },
        { name: "currencyId", label: "Currency", type: "select", lookupKey: "currencies" },
        { name: "transactionDate", label: "Date", type: "date" },
        { name: "paymentMethod", label: "Payment Method", type: "text" },
        { name: "incomeSource", label: "Income Source", type: "text" },
        { name: "attachmentUrl", label: "Attachment URL", type: "text" },
        { name: "note", label: "Note", type: "textarea", fullWidth: true },
      ]}
      defaultValues={{ type: "expense", amount: "", categoryId: "", walletId: "", groupId: "", currencyId: "", transactionDate: "", paymentMethod: "", incomeSource: "", attachmentUrl: "", note: "" }}
      lookups={["categories", "wallets", "groups", "currencies"]}
      filterFields={[
        { name: "type", label: "Type", type: "select", options: [{ value: "income", label: "Income" }, { value: "expense", label: "Expense" }, { value: "transfer", label: "Transfer" }] },
        { name: "categoryId", label: "Category", type: "select", lookupKey: "categories" },
        { name: "walletId", label: "Wallet", type: "select", lookupKey: "wallets" },
        { name: "groupId", label: "Group", type: "select", lookupKey: "groups" },
        { name: "from", label: "From", type: "date" },
        { name: "to", label: "To", type: "date" },
      ]}
    />
  );
}
