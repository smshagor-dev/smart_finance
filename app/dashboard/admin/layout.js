import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }) {
  await requireAdmin();

  return children;
}
