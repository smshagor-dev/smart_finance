import { GroupDetailPage } from "@/components/dashboard/group-detail-page";

export default async function GroupWorkspacePage({ params }) {
  const { id } = await params;
  return <GroupDetailPage groupId={id} />;
}
