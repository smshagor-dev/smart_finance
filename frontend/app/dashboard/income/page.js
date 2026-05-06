import { ModulePage } from "@/components/dashboard/module-page";

export default function IncomePage() {
  return (
    <ModulePage
      title="Income"
      description="Track income entries, source history, and wallet allocations."
      endpoint="/api/transactions"
      columns={[
        { label: "Amount", accessor: "originalAmount", format: "currency", currencyAccessor: "currency.code" },
        { label: "Source", accessor: "incomeSource" },
        { label: "Category", accessor: "category.name" },
        { label: "Wallet", accessor: "wallet.name" },
        { label: "Date", accessor: "transactionDate", format: "date" },
      ]}
      fields={[
        { name: "type", label: "Type", type: "select", options: [{ value: "income", label: "Income" }] },
        { name: "amount", label: "Amount", type: "number" },
        { name: "incomeSource", label: "Income Source", type: "text" },
        { name: "categoryId", label: "Category", type: "select", lookupKey: "incomeCategories" },
        { name: "walletId", label: "Wallet", type: "select", lookupKey: "wallets" },
        { name: "groupId", label: "Group", type: "select", lookupKey: "groups" },
        { name: "currencyId", label: "Currency", type: "select", lookupKey: "currencies" },
        { name: "transactionDate", label: "Income Date", type: "date" },
        { name: "attachmentUrl", label: "Attachment", type: "file-upload", fullWidth: true, uploadLabel: "Upload attachment" },
        { name: "note", label: "Note", type: "textarea", fullWidth: true },
      ]}
      defaultValues={{ type: "income", amount: "", incomeSource: "", categoryId: "", walletId: "", groupId: "", currencyId: "", transactionDate: "", attachmentUrl: "", note: "" }}
      lookups={["incomeCategories", "wallets", "groups", "currencies"]}
      baseFilters={{ type: "income" }}
      filterFields={[
        { name: "categoryId", label: "Category", type: "select", lookupKey: "incomeCategories" },
        { name: "walletId", label: "Wallet", type: "select", lookupKey: "wallets" },
        { name: "groupId", label: "Group", type: "select", lookupKey: "groups" },
        { name: "from", label: "From", type: "date" },
        { name: "to", label: "To", type: "date" },
      ]}
    />
  );
}
