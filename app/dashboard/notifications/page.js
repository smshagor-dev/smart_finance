import { ModulePage } from "@/components/dashboard/module-page";

export default function NotificationsPage() {
  return (
    <ModulePage
      title="Notifications"
      description="Review reminders, budget alerts, low balance warnings, and system notices."
      endpoint="/api/notifications"
      columns={[
        { label: "Title", accessor: "title" },
        { label: "Type", accessor: "type" },
        { label: "Read", accessor: "isRead" },
        { label: "Created", accessor: "createdAt", format: "date" },
      ]}
      fields={[
        { name: "title", label: "Title", type: "text" },
        { name: "message", label: "Message", type: "textarea", fullWidth: true },
        { name: "type", label: "Type", type: "select", options: [{ value: "budget", label: "Budget" }, { value: "bill", label: "Bill" }, { value: "balance", label: "Balance" }, { value: "savings", label: "Savings" }, { value: "insight", label: "Insight" }, { value: "system", label: "System" }] },
        { name: "actionUrl", label: "Action URL", type: "text" },
      ]}
      defaultValues={{ title: "", message: "", type: "system", actionUrl: "" }}
    />
  );
}
