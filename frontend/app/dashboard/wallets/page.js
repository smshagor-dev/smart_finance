import { ModulePage } from "@/components/dashboard/module-page";
import { WALLET_ICON_OPTIONS } from "@/lib/icon-options";

export default function WalletsPage() {
  return (
    <ModulePage
      title="Wallets"
      description="Manage cash, bank, card, savings, and multi-currency accounts."
      endpoint="/api/wallets"
      columns={[
        { label: "Name", accessor: "name" },
        { label: "Type", accessor: "type" },
        { label: "Balance", accessor: "balance", format: "currency", currencyAccessor: "currency.code" },
        { label: "Currency", accessor: "currency.code" },
      ]}
      fields={[
        { name: "name", label: "Name", type: "text" },
        { name: "type", label: "Type", type: "text" },
        { name: "balance", label: "Balance", type: "number" },
        { name: "currencyId", label: "Currency", type: "select", lookupKey: "currencies" },
        { name: "icon", label: "Icon", type: "icon-select", options: WALLET_ICON_OPTIONS },
        { name: "color", label: "Color", type: "text" },
      ]}
      defaultValues={{ name: "", type: "cash", balance: "", currencyId: "", icon: "wallet", color: "#0f766e" }}
      lookups={["currencies"]}
    />
  );
}
