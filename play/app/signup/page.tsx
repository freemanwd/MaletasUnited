import type { Metadata } from "next";
import { OnboardingView } from "@/components/views/OnboardingView";

export const metadata: Metadata = {
  title: "Join / Sign up",
  description: "Create a free Maletas player profile in two steps.",
};

export default function SignupPage() {
  return <OnboardingView />;
}
