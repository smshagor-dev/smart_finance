import { LiveUpdatesProvider } from "@/components/dashboard/live-updates-provider";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { ToastProvider } from "@/components/ui/toast-provider";
import { requireUser } from "@/lib/auth";
import { Toaster } from "sonner";

export default async function DashboardLayout({ children }) {
  const user = await requireUser();

  return (
    <ToastProvider>
      <div className="min-h-screen">
        <LiveUpdatesProvider />
        <Sidebar user={user} />
        <main className="lg:pl-72">
          <div className="mx-auto max-w-7xl p-6 lg:p-8">
            <Topbar user={user} />
            {children}
          </div>
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </ToastProvider>
  );
}
