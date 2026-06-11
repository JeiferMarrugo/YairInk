import AdminClientsClient from "@/components/admin/AdminClientsClient";
import { listClients } from "@/lib/scheduling";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const clients = await listClients();
  return <AdminClientsClient initialClients={clients} />;
}
