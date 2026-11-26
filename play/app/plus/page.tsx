import { redirect } from "next/navigation";

export default async function PlusRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const voucher = typeof params.voucher === "string" ? params.voucher : "";
  redirect(voucher ? `/vip?voucher=${encodeURIComponent(voucher)}` : "/vip");
}
