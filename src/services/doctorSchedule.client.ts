"use client";

import { ApiErrorResponse } from "@/types/api.types";
import { CreateMyDoctorSchedulePayload, IDoctorSchedule } from "@/types/doctorSchedule.types";
import { createDoctorScheduleApiError, DOCTOR_SCHEDULES_ENDPOINT } from "./doctorSchedule.errors";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

const normalizedApiBaseUrl = API_BASE_URL.replace(/\/$/, "");

const buildApiUrl = (endpoint: string) => {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    if (normalizedApiBaseUrl.endsWith("/api/v1")) {
        return `${normalizedApiBaseUrl}${normalizedEndpoint}`;
    }

    return `${normalizedApiBaseUrl}/api/v1${normalizedEndpoint}`;
};

const parseJsonSafely = async <T>(response: Response): Promise<T | null> => {
    try {
        return (await response.json()) as T;
    } catch {
        return null;
    }
};

const throwApiError = (
    message: string,
    errorSources?: ApiErrorResponse["errorSources"],
    status?: number,
    endpoint?: string,
): never => {
    throw createDoctorScheduleApiError({
        message,
        errorSources,
        status,
        endpoint,
    });
};

export const getMyDoctorSchedulesClient = async (queryString?: string) => {
    const endpoint = queryString
        ? `${DOCTOR_SCHEDULES_ENDPOINT}?${queryString}`
        : DOCTOR_SCHEDULES_ENDPOINT;
    const response = await fetch(
        buildApiUrl(endpoint),
        {
            method: "GET",
            credentials: "include",
            cache: "no-store",
        },
    );

    const data = await parseJsonSafely<{
        success: boolean;
        message: string;
        data?: IDoctorSchedule[];
        meta?: {
            page: number;
            limit: number;
            total: number;
            totalPage?: number;
            totalPages?: number;
        };
        errorSources?: ApiErrorResponse["errorSources"];
    }>(response);

    if (!response.ok || !data?.success) {
        throwApiError(
            data?.message || "Failed to fetch doctor schedules.",
            data?.errorSources,
            response.status,
            endpoint,
        );
    }

    const successData = data!;

    return {
        success: true,
        message: successData.message,
        data: successData.data ?? [],
        meta: successData.meta,
    };
};

export const createMyDoctorScheduleClient = async (payload: CreateMyDoctorSchedulePayload) => {
    const endpoint = "/doctor-schedules/create-my-doctor-schedule";
    const response = await fetch(buildApiUrl(endpoint), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    const data = await parseJsonSafely<{
        success: boolean;
        message: string;
        data?: IDoctorSchedule[];
        errorSources?: ApiErrorResponse["errorSources"];
    }>(response);

    if (!response.ok || !data?.success) {
        throwApiError(
            data?.message || "Failed to add doctor schedules.",
            data?.errorSources,
            response.status,
            endpoint,
        );
    }

    const successData = data!;

    return {
        success: true,
        message: successData.message,
        data: successData.data ?? [],
    };
};

export const deleteMyDoctorScheduleClient = async (scheduleId: string) => {
    const endpoint = `/doctor-schedules/delete-my-doctor-schedule/${scheduleId}`;
    const response = await fetch(
        buildApiUrl(endpoint),
        {
            method: "DELETE",
            credentials: "include",
        },
    );

    const data = await parseJsonSafely<{
        success: boolean;
        message: string;
        errorSources?: ApiErrorResponse["errorSources"];
    }>(response);

    if (!response.ok || !data?.success) {
        throwApiError(
            data?.message || "Failed to delete doctor schedule.",
            data?.errorSources,
            response.status,
            endpoint,
        );
    }

    const successData = data!;

    return {
        success: true,
        message: successData.message,
    };
};
