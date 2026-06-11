import AdminReviewsClient from "@/components/admin/AdminReviewsClient";
import { getPublicContent } from "@/lib/content";

export default async function AdminReviewsPage() {
  const { reviews, site } = await getPublicContent();
  return <AdminReviewsClient reviews={reviews} site={site} />;
}
