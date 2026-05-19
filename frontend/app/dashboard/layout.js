import { AuthOnboardingGate } from "@/components/dashboard/auth-onboarding-gate";
import { LiveUpdatesProvider } from "@/components/dashboard/live-updates-provider";
import { NotificationRealtimeListener } from "@/components/dashboard/notification-realtime-listener";
import { NotificationsDrawer } from "@/components/dashboard/notifications-drawer";
import { PwaInstallBanner } from "@/components/dashboard/pwa-install-banner";
import { QuickSetupModal } from "@/components/dashboard/quick-setup-modal";
import { QuickTransactionModal } from "@/components/dashboard/quick-transaction-modal";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { ToastProvider } from "@/components/ui/toast-provider";
import { requireUser } from "@/lib/auth";
import { Toaster } from "sonner";

export default async function DashboardLayout({ children }) {
  const user = await requireUser();

  return (
    <ToastProvider>
      <div className="min-h-screen overflow-x-clip">
        <LiveUpdatesProvider />
        <NotificationRealtimeListener />
        <AuthOnboardingGate user={user} />
        <Sidebar user={user} />
        <main className="lg:pl-72">
          <div className="mx-auto max-w-7xl px-4 pb-28 pt-4 min-[375px]:px-5 min-[390px]:pt-4 min-[430px]:px-6 sm:pb-8 sm:pt-5 lg:p-8">
            <Topbar user={user} />
            <PwaInstallBanner />
            <NotificationsDrawer />
            <QuickSetupModal />
            <QuickTransactionModal />
            {children}
          </div>
        </main>
      </div>
      <Toaster
        richColors
        closeButton
        expand
        visibleToasts={4}
        position="top-right"
        offset={16}
        toastOptions={{
          className: "rounded-2xl border border-border shadow-xl",
        }}
      />
    </ToastProvider>
  );
}
