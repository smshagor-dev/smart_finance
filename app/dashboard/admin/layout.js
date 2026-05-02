import { ShieldCheck } from "lucide-react";
import { AdminNav } from "@/components/dashboard/admin-nav";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }) {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-emerald-200/80 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 p-6 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Control
            </div>
            <h2 className="mt-4 text-3xl font-semibold">Global finance operations</h2>
            <p className="mt-2 max-w-2xl text-sm text-emerald-50/80">
              Monitor every account, review platform-wide activity, and handle user management from one secure workspace.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-emerald-50/85">
            Administrator access is active for this session.
          </div>
        </div>
      </Card>

      <AdminNav />

      {children}
    </div>
  );
}
