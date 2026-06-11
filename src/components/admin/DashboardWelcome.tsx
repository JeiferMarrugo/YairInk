"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DashboardWelcome() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("bienvenido") === "1") {
      toast.success("Sesión iniciada", {
        description: "Bienvenido al panel de YAIRINK.",
      });
      router.replace("/admin");
    }
  }, [searchParams, router]);

  return null;
}
