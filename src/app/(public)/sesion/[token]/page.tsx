import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SessionSummaryClient from "@/components/SessionSummaryClient";
import { getSessionByToken } from "@/lib/sessions";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function SessionPage({ params }: PageProps) {
  const { token } = await params;
  const session = await getSessionByToken(token);

  if (!session) notFound();

  return (
    <>
      <Header />
      <SessionSummaryClient session={session} />
      <Footer />
    </>
  );
}
