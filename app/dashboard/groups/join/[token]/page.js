import { GroupJoinPage } from "@/components/dashboard/group-join-page";

export default async function GroupJoinRoutePage({ params }) {
  const { token } = await params;
  return <GroupJoinPage token={token} />;
}
