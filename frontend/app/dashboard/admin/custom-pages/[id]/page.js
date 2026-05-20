import { AdminCustomPageEditor } from "@/components/dashboard/admin-custom-page-editor";

export default async function AdminCustomPageDetailRoute({ params }) {
  const { id } = await params;
  return <AdminCustomPageEditor pageId={id} />;
}
