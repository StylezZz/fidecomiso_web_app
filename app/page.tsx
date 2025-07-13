import { redirect } from "next/navigation";

export default function Home() {
  redirect("/simulation");
  return null;
}

export const dynamic = "force-dynamic";
