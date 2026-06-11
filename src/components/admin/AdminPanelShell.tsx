"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { AdminLayoutProvider, useAdminLayout } from "@/contexts/AdminLayoutContext";

function AdminPanelShellInner({ children }: { children: React.ReactNode }) {
  const { mobileNavOpen, setMobileNavOpen } = useAdminLayout();

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-white">
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <AdminSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default function AdminPanelShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayoutProvider>
      <AdminPanelShellInner>{children}</AdminPanelShellInner>
    </AdminLayoutProvider>
  );
}
