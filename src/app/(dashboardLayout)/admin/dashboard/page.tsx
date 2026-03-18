import AdminDashboardContent from "@/components/modules/Dashboard/AdminDashboardContent";
import { getDashboardData } from "@/services/dashboard.services";

const AdminDashboardPage = async () => {
  const dashboardResponse = await getDashboardData();
  
  return (
    <AdminDashboardContent dashboardResponse={dashboardResponse} />
  )
}

export default AdminDashboardPage
