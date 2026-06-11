import AdminContentClient from "@/components/admin/AdminContentClient";
import { getEditableContent } from "@/lib/content-admin";

export default async function AdminConfigPage() {
  const content = await getEditableContent();
  return <AdminContentClient initialContent={content} />;
}
