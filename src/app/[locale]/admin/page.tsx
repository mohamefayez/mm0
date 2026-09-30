import { AdminDashboard, AdminLogin } from "@/components/admin/dashboard";
import { isAdmin } from "@/lib/admin-auth";
export const metadata = {
  title: "Asel — Store management",
  robots: { index: false, follow: false },
};
export default async function AdminPage() {
  return (await isAdmin()) ? <AdminDashboard /> : <AdminLogin />;
}
