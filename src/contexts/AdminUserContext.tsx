"use client";

import { createContext, useContext } from "react";

export type AdminSessionUser = {
  name: string;
  role: string;
  email: string;
};

const AdminUserContext = createContext<AdminSessionUser | null>(null);

export function AdminUserProvider({
  user,
  children,
}: {
  user: AdminSessionUser;
  children: React.ReactNode;
}) {
  return (
    <AdminUserContext.Provider value={user}>{children}</AdminUserContext.Provider>
  );
}

export function useAdminUser(): AdminSessionUser {
  const user = useContext(AdminUserContext);
  if (!user) {
    return {
      name: "Administrador",
      role: "ADMIN",
      email: "",
    };
  }
  return user;
}
