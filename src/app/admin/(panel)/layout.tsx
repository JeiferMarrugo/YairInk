import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminProviders from "@/components/admin/AdminProviders";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminProviders
      user={{
        name: session.name,
        role: session.role,
        email: session.email,
      }}
    >
      <div className="flex h-screen overflow-hidden bg-white">
        <AdminSidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </AdminProviders>
  );
}
