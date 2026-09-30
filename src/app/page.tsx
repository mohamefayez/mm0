import { redirect } from "next/navigation";
import { cookies } from "next/headers";
export default async function RootPage() {
  const locale =
    (await cookies()).get("asel-locale")?.value === "ar" ? "ar" : "en";
  redirect(`/${locale}`);
}
