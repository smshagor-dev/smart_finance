import { ModulePage } from "@/components/dashboard/module-page";

export default function DebtsPage() {
  return (
    <ModulePage
      title="Debt & Loans"
      description="Track borrowed and lent money, due dates, partial payments, and settlement status."
      endpoint="/api/debts"
      columns={[
        { label: "Person", accessor: "personName" },
        { label: "Type", accessor: "type" },
        { label: "Amount", accessor: "amount", format: "currency" },
        { label: "Paid", accessor: "paidAmount", format: "currency" },
        { label: "Status", accessor: "status" },
      ]}
      fields={[
        { name: "personName", label: "Person Name", type: "text" },
        { name: "type", label: "Type", type: "select", options: [{ value: "borrowed", label: "Borrowed" }, { value: "lent", label: "Lent" }] },
        { name: "amount", label: "Amount", type: "number" },
        { name: "paidAmount", label: "Paid Amount", type: "number" },
        { name: "dueDate", label: "Due Date", type: "date" },
        { name: "status", label: "Status", type: "select", options: [{ value: "unpaid", label: "Unpaid" }, { value: "partial", label: "Partial" }, { value: "paid", label: "Paid" }] },
        { name: "note", label: "Note", type: "textarea", fullWidth: true },
      ]}
      defaultValues={{ personName: "", type: "borrowed", amount: "", paidAmount: 0, dueDate: "", status: "unpaid", note: "" }}
    />
  );
}
