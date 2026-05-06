import { ModulePage } from "@/components/dashboard/module-page";
import { SAVINGS_GOAL_ICON_OPTIONS } from "@/lib/icon-options";

export default function SavingsGoalsPage() {
  return (
    <ModulePage
      title="Savings Goals"
      description="Create savings targets, track progress, and manage completion."
      endpoint="/api/savings-goals"
      columns={[
        { label: "Title", accessor: "title" },
        { label: "Target", accessor: "targetAmount", format: "currency" },
        { label: "Current", accessor: "currentAmount", format: "currency" },
        { label: "Deadline", accessor: "deadline", format: "date" },
        { label: "Status", accessor: "status" },
      ]}
      fields={[
        { name: "title", label: "Title", type: "text" },
        { name: "targetAmount", label: "Target Amount", type: "number" },
        { name: "currentAmount", label: "Current Amount", type: "number" },
        { name: "deadline", label: "Deadline", type: "date" },
        { name: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "completed", label: "Completed" }, { value: "paused", label: "Paused" }] },
        { name: "icon", label: "Icon", type: "icon-select", options: SAVINGS_GOAL_ICON_OPTIONS },
        { name: "color", label: "Color", type: "text" },
        { name: "note", label: "Note", type: "textarea", fullWidth: true },
      ]}
      defaultValues={{ title: "", targetAmount: "", currentAmount: 0, deadline: "", status: "active", icon: "target", color: "#2563eb", note: "" }}
    />
  );
}
