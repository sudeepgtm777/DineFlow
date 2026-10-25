import type { Metadata } from "next";
import PendingCook from "@/components/auth/PendingCook";

export const metadata: Metadata = {
  title: "Pending approval",
};

export default function Page() {
  return <PendingCook />;
}
