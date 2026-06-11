"use client";

import { Toaster as Sonner } from "sonner";

export default function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group !bg-white !border !border-black/10 !text-black !shadow-lg !font-sans",
          title: "!text-sm !font-medium",
          description: "!text-xs !text-black/60",
          success: "!border-black/20",
          error: "!bg-black !text-white !border-black",
          actionButton: "!bg-black !text-white",
          cancelButton: "!bg-off-white !text-black",
        },
      }}
      closeButton
    />
  );
}
