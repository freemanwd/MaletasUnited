import type { Metadata } from "next";
import { HostsView } from "@/components/views/HostsView";

export const metadata: Metadata = {
  title: "Hosts",
  description: "Hosts own the field time. Jacksonville is the first hub.",
};

export default function HostsPage() {
  return <HostsView />;
}
