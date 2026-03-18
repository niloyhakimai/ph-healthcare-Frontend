"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ApiResponse } from "@/types/api.types";
import { IAdminDashboardData } from "@/types/dashboard.types";

const emptyDashboardData: IAdminDashboardData = {
    appointmentCount: 0,
    patientCount: 0,
    doctorCount: 0,
    adminCount: 0,
    superAdminCount: 0,
    paymentCount: 0,
    userCount: 0,
    totalRevenue: 0,
    barChartData: [],
    pieChartData: [],
};

export async function getDashboardData(): Promise<ApiResponse<IAdminDashboardData>> {
    try {
        const response = await httpClient.get<IAdminDashboardData>("/stats", {
            suppressErrorLog: true,
        })

        return response;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An error accurred while fetching data";
        console.log(error, "Form Dashboard Server Action");

        return {
            success: false,
            message,
            data: emptyDashboardData,
            meta : undefined
        }
    }
}
