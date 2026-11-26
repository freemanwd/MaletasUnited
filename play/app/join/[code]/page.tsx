import type { Metadata } from "next";
import { JoinView } from "@/components/views/JoinView";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: "Invite",
    description: `Join Maletas with invite code ${code}.`,
  };
}

export default async function JoinPage({ params }: Props) {
  const { code } = await params;
  return <JoinView code={code} />;
}
