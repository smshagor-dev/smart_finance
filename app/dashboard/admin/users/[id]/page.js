import { AdminUserDetailPage } from "@/components/dashboard/admin-user-detail-page";

export default async function AdminUserDetailRoutePage({ params }) {
  const { id } = await params;

  return <AdminUserDetailPage userId={id} />;
}
