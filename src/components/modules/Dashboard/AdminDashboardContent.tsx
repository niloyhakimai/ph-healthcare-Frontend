"use client"

import AppointmentBarChart from "@/components/shared/AppointmentBarChart"
import AppointmentPieChart from "@/components/shared/AppointmentPieChart"
import StatsCard from "@/components/shared/StatsCard"
import { ApiResponse } from "@/types/api.types"
import { IAdminDashboardData } from "@/types/dashboard.types"

interface AdminDashboardContentProps {
    dashboardResponse: ApiResponse<IAdminDashboardData>;
}

const AdminDashboardContent = ({ dashboardResponse }: AdminDashboardContentProps) => {
    const data = dashboardResponse?.data;
  return (
    <div>
        <StatsCard 
        title="Total Appointments"
        value={data?.appointmentCount || 0}
        iconName="CalendarDays"
        description="Number of appointments scheduled"
        />
        <StatsCard 
        title="Total Patients"
        value={data?.patientCount || 0}
        iconName="Users"
        description="Number of registered patients"
        />

        <AppointmentBarChart 
        data={data?.barChartData || []}
        />

        <AppointmentPieChart 
        data={data?.pieChartData || []}
        />
    </div>
  )
}

export default AdminDashboardContent
