"use client";

import { Toaster as Sonner } from "sonner";

export default function Toaster() {
  return (
    <Sonner
      theme="light"
      position="top-right"
      richColors={false}
      toastOptions={{
        classNames: {
          toast:
            "group !bg-white !border !border-black/10 !shadow-lg !font-sans",
          title: "!text-sm !font-medium !text-black",
          description: "!text-xs !text-black/60",
          success:
            "!bg-white !border-black/20 [&_[data-title]]:!text-black [&_[data-description]]:!text-black/60",
          error:
            "!bg-black !border-black [&_[data-title]]:!text-white [&_[data-description]]:!text-white/80 [&_[data-button]]:!text-white [&_[data-close-button]]:!text-white [&_[data-close-button]]:!border-white/30",
          actionButton: "!bg-black !text-white",
          cancelButton: "!bg-off-white !text-black",
          closeButton:
            "!bg-transparent !text-black/50 !border-black/10 group-[.toast-error]:!text-white group-[.toast-error]:!border-white/30",
        },
      }}
      closeButton
    />
  );
}
