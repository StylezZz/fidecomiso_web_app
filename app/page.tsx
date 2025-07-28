import { redirect } from "next/navigation";

export default function Home() {
  redirect("/simulaciones");
  return null;
}

export const dynamic = "force-dynamic";
