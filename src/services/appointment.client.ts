"use client";

import {
    IAppointment,
    IBookAppointmentPayload,
    IBookAppointmentResponseData,
    IInitiatePaymentResponseData,
} from "@/types/appointment.types";
import { ApiErrorResponse } from "@/types/api.types";

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
    statusCode?: number,
): never => {
    throw {
        success: false,
        message,
        errorSources,
        statusCode,
    } satisfies ApiErrorResponse & { statusCode?: number };
};

type GetMyAppointmentsClientResponse = {
    success: true;
    message: string;
    data: IAppointment[];
};

type BookAppointmentClientResponse = {
    success: true;
    message: string;
    data: IBookAppointmentResponseData;
};

type InitiateAppointmentPaymentClientResponse = {
    success: true;
    message: string;
    data: IInitiatePaymentResponseData;
};

export const getMyAppointmentsClient = async (): Promise<GetMyAppointmentsClientResponse> => {
    const response = await fetch(buildApiUrl("/appointments/my-appointments"), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
    });

    const data = await parseJsonSafely<{
        success: boolean;
        message: string;
        data?: IAppointment[];
        errorSources?: ApiErrorResponse["errorSources"];
    }>(response);

    if (!response.ok || !data?.success) {
        throwApiError(
            data?.message || "Failed to fetch appointments.",
            data?.errorSources,
            response.status,
        );
    }

    const successData = data!;

    return {
        success: true,
        message: successData.message,
        data: successData.data ?? [],
    };
};

export const bookAppointmentClient = async (
    payload: IBookAppointmentPayload,
): Promise<BookAppointmentClientResponse> => {
    const response = await fetch(buildApiUrl("/appointments/book-appointment"), {
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
        data?: IBookAppointmentResponseData;
        errorSources?: ApiErrorResponse["errorSources"];
    }>(response);

    if (!response.ok || !data?.success || !data.data) {
        throwApiError(
            data?.message || "Failed to book appointment.",
            data?.errorSources,
            response.status,
        );
    }

    const successData = data!;

    return {
        success: true,
        message: successData.message,
        data: successData.data!,
    };
};

export const bookAppointmentWithPayLaterClient = async (
    payload: IBookAppointmentPayload,
): Promise<BookAppointmentClientResponse> => {
    const response = await fetch(buildApiUrl("/appointments/book-appointment-with-pay-later"), {
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
        data?: IBookAppointmentResponseData;
        errorSources?: ApiErrorResponse["errorSources"];
    }>(response);

    if (!response.ok || !data?.success || !data.data) {
        throwApiError(
            data?.message || "Failed to book appointment with pay later.",
            data?.errorSources,
            response.status,
        );
    }

    const successData = data!;

    return {
        success: true,
        message: successData.message,
        data: successData.data!,
    };
};

export const initiateAppointmentPaymentClient = async (
    appointmentId: string,
): Promise<InitiateAppointmentPaymentClientResponse> => {
    const response = await fetch(buildApiUrl(`/appointments/initiate-payment/${appointmentId}`), {
        method: "POST",
        credentials: "include",
    });

    const data = await parseJsonSafely<{
        success: boolean;
        message: string;
        data?: IInitiatePaymentResponseData;
        errorSources?: ApiErrorResponse["errorSources"];
    }>(response);

    if (!response.ok || !data?.success || !data.data?.paymentUrl) {
        throwApiError(
            data?.message || "Failed to initiate payment.",
            data?.errorSources,
            response.status,
        );
    }

    const successData = data!;

    return {
        success: true,
        message: successData.message,
        data: successData.data!,
    };
};
