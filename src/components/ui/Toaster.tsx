"use client";

import { Toaster as Sonner } from "sonner";

export default function Toaster() {
  return (
    <Sonner
      theme="light"
      position="top-right"
      richColors={false}
      toastOptions={{
        style: {
          background: "#ffffff",
          color: "#000000",
          border: "1px solid rgba(0,0,0,0.1)",
        },
        classNames: {
          toast: "!shadow-lg !font-sans",
          title: "!text-sm !font-medium",
          description: "!text-xs !opacity-70",
          success: "!bg-white !text-black !border-black/20",
          error: "!bg-black !text-white !border-black",
          actionButton: "!bg-black !text-white",
          cancelButton: "!bg-off-white !text-black",
          closeButton:
            "!bg-transparent !border-black/10 group-[.toast-error]:!text-white group-[.toast-error]:!border-white/30",
        },
      }}
      closeButton
    />
  );
}
