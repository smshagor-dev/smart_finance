import { ModulePage } from "@/components/dashboard/module-page";
import { CATEGORY_ICON_OPTIONS } from "@/lib/icon-options";

export default function CategoriesPage() {
  return (
    <ModulePage
      title="Categories"
      description="Manage income and expense categories with custom colors and icons."
      endpoint="/api/categories"
      columns={[
        { label: "Name", accessor: "name" },
        { label: "Type", accessor: "type" },
        { label: "Color", accessor: "color" },
        { label: "Default", accessor: "isDefault" },
      ]}
      fields={[
        { name: "name", label: "Name", type: "text" },
        { name: "type", label: "Type", type: "select", options: [{ value: "income", label: "Income" }, { value: "expense", label: "Expense" }] },
        { name: "icon", label: "Icon", type: "icon-select", options: CATEGORY_ICON_OPTIONS },
        { name: "color", label: "Color", type: "text" },
      ]}
      defaultValues={{ name: "", type: "expense", icon: "", color: "#0f766e" }}
    />
  );
}
