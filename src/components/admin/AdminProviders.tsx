"use client";

import NextTopLoader from "nextjs-toploader";
import SessionIdleGuard from "@/components/admin/SessionIdleGuard";
import {
  AdminUserProvider,
  type AdminSessionUser,
} from "@/contexts/AdminUserContext";

export default function AdminProviders({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AdminSessionUser;
}) {
  return (
    <AdminUserProvider user={user}>
      <NextTopLoader
        color="#000000"
        height={2}
        showSpinner={false}
        crawlSpeed={180}
        easing="ease"
        shadow="0 0 8px rgba(0,0,0,0.12)"
      />
      <SessionIdleGuard />
      {children}
    </AdminUserProvider>
  );
}
