"use client";

import CookLayout from "@/components/cook/CookLayout";
import CookProtectedRoute from "@/components/auth/CookProtectedRoute";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <CookProtectedRoute>
      <CookLayout>{children}</CookLayout>
    </CookProtectedRoute>
  );
}
