"use client";

import { ApiErrorResponse } from "@/types/api.types";
import { CreateSchedulePayload, ISchedule, UpdateSchedulePayload } from "@/types/schedule.types";

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
): never => {
    throw {
        success: false,
        message,
        errorSources,
    } satisfies ApiErrorResponse;
};

export const getSchedulesClient = async (queryString?: string) => {
    const response = await fetch(
        buildApiUrl(queryString ? `/schedules?${queryString}` : "/schedules"),
        {
            method: "GET",
            credentials: "include",
            cache: "no-store",
        },
    );

    const data = await parseJsonSafely<{
        success: boolean;
        message: string;
        data?: ISchedule[];
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
        throwApiError(data?.message || "Failed to fetch schedules.", data?.errorSources);
    }

    const successData = data!;

    return {
        success: true,
        message: successData.message,
        data: successData.data ?? [],
        meta: successData.meta,
    };
};

export const getScheduleByIdClient = async (id: string) => {
    const response = await fetch(buildApiUrl(`/schedules/${id}`), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
    });

    const data = await parseJsonSafely<{
        success: boolean;
        message: string;
        data?: ISchedule;
        errorSources?: ApiErrorResponse["errorSources"];
    }>(response);

    if (!response.ok || !data?.success || !data.data) {
        throwApiError(data?.message || "Failed to fetch schedule.", data?.errorSources);
    }

    const successData = data!;

    return {
        success: true,
        message: successData.message,
        data: successData.data,
    };
};

export const createScheduleClient = async (payload: CreateSchedulePayload) => {
    const response = await fetch(buildApiUrl("/schedules"), {
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
        data?: ISchedule[];
        errorSources?: ApiErrorResponse["errorSources"];
    }>(response);

    if (!response.ok || !data?.success) {
        throwApiError(data?.message || "Failed to create schedules.", data?.errorSources);
    }

    const successData = data!;

    return {
        success: true,
        message: successData.message,
        data: successData.data ?? [],
    };
};

export const updateScheduleClient = async (id: string, payload: UpdateSchedulePayload) => {
    const response = await fetch(buildApiUrl(`/schedules/${id}`), {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    const data = await parseJsonSafely<{
        success: boolean;
        message: string;
        data?: ISchedule;
        errorSources?: ApiErrorResponse["errorSources"];
    }>(response);

    if (!response.ok || !data?.success || !data.data) {
        throwApiError(data?.message || "Failed to update schedule.", data?.errorSources);
    }

    const successData = data!;

    return {
        success: true,
        message: successData.message,
        data: successData.data,
    };
};

export const deleteScheduleClient = async (id: string) => {
    const response = await fetch(buildApiUrl(`/schedules/${id}`), {
        method: "DELETE",
        credentials: "include",
    });

    const data = await parseJsonSafely<{
        success: boolean;
        message: string;
        errorSources?: ApiErrorResponse["errorSources"];
    }>(response);

    if (!response.ok || !data?.success) {
        throwApiError(data?.message || "Failed to delete schedule.", data?.errorSources);
    }

    const successData = data!;

    return {
        success: true,
        message: successData.message,
    };
};
