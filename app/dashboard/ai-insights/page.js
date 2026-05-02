import { ModulePage } from "@/components/dashboard/module-page";

export default function AIInsightsPage() {
  return (
    <ModulePage
      title="AI Insights"
      description="Rule-based financial insights with a structure ready for future LLM integration."
      endpoint="/api/ai-insights"
      columns={[
        { label: "Title", accessor: "title" },
        { label: "Type", accessor: "insightType" },
        { label: "Severity", accessor: "severity" },
        { label: "Generated", accessor: "generatedAt", format: "date" },
      ]}
      fields={[
        { name: "insightType", label: "Insight Type", type: "text" },
        { name: "title", label: "Title", type: "text" },
        { name: "description", label: "Description", type: "textarea", fullWidth: true },
        { name: "severity", label: "Severity", type: "select", options: [{ value: "info", label: "Info" }, { value: "warning", label: "Warning" }, { value: "danger", label: "Danger" }, { value: "success", label: "Success" }] },
      ]}
      defaultValues={{ insightType: "spending", title: "", description: "", severity: "info" }}
    />
  );
}
