import { ApiErrorResponse } from "@/types/api.types";

export interface DoctorScheduleApiError extends Error, ApiErrorResponse {
    status?: number;
    endpoint?: string;
}

interface DoctorScheduleErrorDetails {
    message: string;
    errorSources?: ApiErrorResponse["errorSources"];
    status?: number;
    endpoint?: string;
}

export interface DoctorScheduleErrorDisplay {
    title: string;
    message: string;
    hint?: string;
    isDoctorProfileMissing: boolean;
}

export const DOCTOR_SCHEDULES_ENDPOINT = "/doctor-schedules/my-doctor-schedules";
export const DOCTOR_PROFILE_NOT_FOUND_MESSAGE = "Doctor profile not found for this account.";

const DEFAULT_DOCTOR_SCHEDULES_ERROR_MESSAGE = "Failed to fetch doctor schedules.";

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const isAxiosLikeError = (
    value: unknown,
): value is {
    isAxiosError: true;
    response?: {
        status?: number;
        data?: ApiErrorResponse;
    };
    config?: {
        url?: string;
    };
} => isObject(value) && value.isAxiosError === true;

const isTransportMessage = (message: string) =>
    /^Request failed with status code \d{3}$/i.test(message.trim());

export const createDoctorScheduleApiError = ({
    message,
    errorSources,
    status,
    endpoint,
}: DoctorScheduleErrorDetails): DoctorScheduleApiError => {
    const error = new Error(message) as DoctorScheduleApiError;
    error.name = "DoctorScheduleApiError";
    error.success = false;
    error.errorSources = errorSources;
    error.status = status;
    error.endpoint = endpoint;

    return error;
};

export const normalizeDoctorScheduleApiError = (
    error: unknown,
    fallbackMessage = DEFAULT_DOCTOR_SCHEDULES_ERROR_MESSAGE,
    endpoint = DOCTOR_SCHEDULES_ENDPOINT,
): DoctorScheduleApiError => {
    if (isAxiosLikeError(error)) {
        return createDoctorScheduleApiError({
            message: error.response?.data?.message || fallbackMessage,
            errorSources: error.response?.data?.errorSources,
            status: error.response?.status,
            endpoint: error.config?.url || endpoint,
        });
    }

    if (isObject(error)) {
        return createDoctorScheduleApiError({
            message:
                typeof error.message === "string" && error.message.trim()
                    ? error.message
                    : fallbackMessage,
            errorSources: Array.isArray(error.errorSources)
                ? (error.errorSources as ApiErrorResponse["errorSources"])
                : undefined,
            status:
                typeof error.status === "number"
                    ? error.status
                    : typeof error.statusCode === "number"
                        ? error.statusCode
                        : undefined,
            endpoint: typeof error.endpoint === "string" ? error.endpoint : endpoint,
        });
    }

    if (error instanceof Error) {
        return createDoctorScheduleApiError({
            message: error.message || fallbackMessage,
            endpoint,
        });
    }

    return createDoctorScheduleApiError({
        message: fallbackMessage,
        endpoint,
    });
};

export const isDoctorProfileMissingError = (error: unknown) => {
    const normalizedError = normalizeDoctorScheduleApiError(error);

    return normalizedError.message.toLowerCase().includes("doctor profile not found");
};

const getFriendlyDoctorSchedulesMessage = (error: DoctorScheduleApiError) => {
    if (
        !error.message
        || error.message === DEFAULT_DOCTOR_SCHEDULES_ERROR_MESSAGE
        || isTransportMessage(error.message)
    ) {
        return "We couldn't load your assigned schedules right now.";
    }

    return error.message;
};

export const getDoctorScheduleErrorDisplay = (error: unknown): DoctorScheduleErrorDisplay => {
    const normalizedError = normalizeDoctorScheduleApiError(error);
    const friendlyMessage = getFriendlyDoctorSchedulesMessage(normalizedError);

    if (isDoctorProfileMissingError(normalizedError)) {
        return {
            title: "Doctor profile setup is incomplete",
            message: DOCTOR_PROFILE_NOT_FOUND_MESSAGE,
            hint: "This doctor account does not have a linked doctor profile yet. Contact an administrator to complete setup before schedules can be assigned.",
            isDoctorProfileMissing: true,
        };
    }

    return {
        title: normalizedError.status === 404 ? "Schedules are unavailable" : "Unable to load schedules",
        message: friendlyMessage,
        hint:
            normalizedError.status && normalizedError.status >= 500
                ? "The server returned an error while loading your assigned doctor schedules. Please try again in a moment."
                : "Refresh the page or try again shortly.",
        isDoctorProfileMissing: false,
    };
};

export const shouldRetryDoctorScheduleRequest = (failureCount: number, error: unknown) => {
    const normalizedError = normalizeDoctorScheduleApiError(error);

    if (normalizedError.status && normalizedError.status >= 400 && normalizedError.status < 500) {
        return false;
    }

    return failureCount < 2;
};
