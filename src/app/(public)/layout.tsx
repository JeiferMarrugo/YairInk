import type { Metadata } from "next";
import { getPublicContent } from "@/lib/content";
import { PublicContentProvider } from "@/contexts/PublicContentContext";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {  const { site } = await getPublicContent();
  return {
    title: site.seo.title,
    description: site.seo.description,
  };
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getPublicContent();

  return (
    <PublicContentProvider content={content}>{children}</PublicContentProvider>
  );
}
