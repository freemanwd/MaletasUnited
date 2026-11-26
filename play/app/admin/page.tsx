import type { Metadata } from "next";
import { AdminView } from "@/components/views/AdminView";

export const metadata: Metadata = {
  title: "Admin",
  description: "Sample admin figures. Production is gated by Clerk admin roles.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminView />;
}
