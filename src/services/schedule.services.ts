"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ApiErrorResponse } from "@/types/api.types";
import { CreateSchedulePayload, ISchedule, UpdateSchedulePayload } from "@/types/schedule.types";
import axios from "axios";

const throwTypedApiError = (error: unknown): never => {
    if (axios.isAxiosError<ApiErrorResponse>(error) && error.response?.data) {
        throw error.response.data;
    }

    throw error;
};

export const getSchedules = async (queryString?: string) => {
    try {
        const schedules = await httpClient.get<ISchedule[]>(
            queryString ? `/schedules?${queryString}` : "/schedules",
            { skipTokenRefresh: true },
        );

        return schedules;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const getScheduleById = async (id: string) => {
    try {
        const schedule = await httpClient.get<ISchedule>(
            `/schedules/${id}`,
            {
                suppressErrorLog: true,
                skipTokenRefresh: true,
            },
        );

        if (!schedule.success) {
            throw {
                success: false,
                message: schedule.message || "Failed to fetch schedule.",
            } satisfies ApiErrorResponse;
        }

        return schedule;
    } catch (error) {
        throwTypedApiError(error);
    }
};

export const createSchedule = async (payload: CreateSchedulePayload) => {
    try {
        const schedule = await httpClient.post<ISchedule[]>(
            "/schedules",
            payload,
            { suppressErrorLog: true },
        );

        if (!schedule.success) {
            throw {
                success: false,
                message: schedule.message || "Failed to create schedules.",
            } satisfies ApiErrorResponse;
        }

        return schedule;
    } catch (error) {
        throwTypedApiError(error);
    }
};

export const updateSchedule = async (id: string, payload: UpdateSchedulePayload) => {
    try {
        const schedule = await httpClient.patch<ISchedule>(
            `/schedules/${id}`,
            payload,
            { suppressErrorLog: true },
        );

        if (!schedule.success) {
            throw {
                success: false,
                message: schedule.message || "Failed to update schedule.",
            } satisfies ApiErrorResponse;
        }

        return schedule;
    } catch (error) {
        throwTypedApiError(error);
    }
};

export const deleteSchedule = async (id: string) => {
    try {
        const response = await httpClient.delete<unknown>(
            `/schedules/${id}`,
            { suppressErrorLog: true },
        );

        if (!response.success) {
            throw {
                success: false,
                message: response.message || "Failed to delete schedule.",
            } satisfies ApiErrorResponse;
        }

        return response;
    } catch (error) {
        throwTypedApiError(error);
    }
};
