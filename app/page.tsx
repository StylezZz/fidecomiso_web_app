import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to dashboard
  redirect("/login")
  return null
}

export const dynamic = "force-dynamic";