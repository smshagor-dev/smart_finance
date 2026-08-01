import { redirect } from "next/navigation";
import { getCurrentUserSafely } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUserSafely();
  redirect(user ? "/dashboard" : "/login");
}
