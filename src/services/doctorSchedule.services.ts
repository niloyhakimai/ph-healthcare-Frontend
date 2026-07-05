"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IDoctorSchedule } from "@/types/doctorSchedule.types";
import {
    createDoctorScheduleApiError,
    DOCTOR_SCHEDULES_ENDPOINT,
    normalizeDoctorScheduleApiError,
} from "./doctorSchedule.errors";

export const getMyDoctorSchedules = async (queryString?: string) => {
    const endpoint = queryString
        ? `${DOCTOR_SCHEDULES_ENDPOINT}?${queryString}`
        : DOCTOR_SCHEDULES_ENDPOINT;

    try {
        const doctorSchedules = await httpClient.get<IDoctorSchedule[]>(
            endpoint,
            {
                suppressErrorLog: true,
                skipTokenRefresh: true,
            },
        );

        if (!doctorSchedules.success) {
            throw createDoctorScheduleApiError({
                message: doctorSchedules.message || "Failed to fetch doctor schedules.",
                endpoint,
            });
        }

        return doctorSchedules;
    } catch (error) {
        throw normalizeDoctorScheduleApiError(error, "Failed to fetch doctor schedules.", endpoint);
    }
};
