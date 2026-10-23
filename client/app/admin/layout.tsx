"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </AdminProtectedRoute>
  );
}
