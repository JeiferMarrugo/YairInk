import AdminPanelShell from "@/components/admin/AdminPanelShell";
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
      <AdminPanelShell>{children}</AdminPanelShell>
    </AdminProviders>
  );
}
