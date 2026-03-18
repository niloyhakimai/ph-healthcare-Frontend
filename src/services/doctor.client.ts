"use client";

import { ApiErrorResponse } from "@/types/api.types";
import { CreateDoctorPayload, CreateDoctorResponseData } from "@/types/doctor.types";

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

export const createDoctorClient = async (payload: CreateDoctorPayload) => {
    const response = await fetch(buildApiUrl("/users/create-doctor"), {
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
        data?: CreateDoctorResponseData;
        errorSources?: ApiErrorResponse["errorSources"];
        error?: unknown;
        stack?: string;
    }>(response);

    if (!response.ok || !data?.success) {
        throw {
            success: false,
            message: data?.message || "Failed to create doctor.",
            errorSources: data?.errorSources,
            error: data?.error,
            stack: data?.stack,
        } satisfies ApiErrorResponse & {
            error?: unknown;
            stack?: string;
        };
    }

    return {
        success: true,
        message: data.message,
        data: data.data as CreateDoctorResponseData,
    };
};
