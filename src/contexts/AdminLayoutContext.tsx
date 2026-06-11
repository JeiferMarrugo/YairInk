"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type AdminLayoutContextValue = {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
};

const AdminLayoutContext = createContext<AdminLayoutContextValue | null>(null);

export function AdminLayoutProvider({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  return (
    <AdminLayoutContext.Provider
      value={{
        mobileNavOpen,
        setMobileNavOpen,
        toggleMobileNav: () => setMobileNavOpen((open) => !open),
      }}
    >
      {children}
    </AdminLayoutContext.Provider>
  );
}

export function useAdminLayout() {
  const context = useContext(AdminLayoutContext);
  if (!context) {
    throw new Error("useAdminLayout debe usarse dentro de AdminLayoutProvider.");
  }
  return context;
}
