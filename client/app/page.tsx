"use client";

import { Suspense } from "react";
import GuestUserDashboard from "@/legacy-pages/user/GuestUserDashboard";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GuestUserDashboard />
    </Suspense>
  );
}
