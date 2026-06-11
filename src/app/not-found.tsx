import type { Metadata } from "next";
import NotFoundPage from "@/components/NotFoundPage";

export const metadata: Metadata = {
  title: "404 — YAIRINK",
  description: "La página que buscas no existe.",
};

export default function NotFound() {
  return <NotFoundPage />;
}
