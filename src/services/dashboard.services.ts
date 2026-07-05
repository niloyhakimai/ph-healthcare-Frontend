"use server";

import { httpClient } from "@/lib/axios/httpClient";
import axios from "axios";
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
        });

        return response;
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return {
                success: false,
                message: "Dashboard metrics are not available yet. Showing empty values until the stats API is ready.",
                data: emptyDashboardData,
                meta: undefined,
            };
        }

        const message = error instanceof Error ? error.message : "An error occurred while fetching dashboard data.";

        console.error("Failed to fetch dashboard data:", error);

        return {
            success: false,
            message,
            data: emptyDashboardData,
            meta: undefined,
        };
    }
}
