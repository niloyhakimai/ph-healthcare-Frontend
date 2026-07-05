"use server";
import { httpClient } from "@/lib/axios/httpClient";
import { ApiErrorResponse, ApiResponse } from "@/types/api.types";
import {
    CreateDoctorPayload,
    CreateDoctorResponseData,
    DeleteDoctorResponseData,
    IDoctor,
    IDoctorDetails,
    UpdateDoctorPayload,
} from "@/types/doctor.types";
import axios from "axios";

const throwTypedApiError = (error: unknown): never => {
    if (axios.isAxiosError<ApiErrorResponse>(error) && error.response?.data) {
        throw error.response.data;
    }

    throw error;
};

export const getDoctors = async (queryString?: string): Promise<ApiResponse<IDoctor[]>> => {
    try {
        const doctors = await httpClient.get<IDoctor[]>(
            queryString ? `/doctors?${queryString}` : "/doctors",
            { suppressErrorLog: true },
        );

        if (!doctors.success) {
            throw {
                success: false,
                message: doctors.message || "Failed to fetch doctors.",
            } satisfies ApiErrorResponse;
        }

        return doctors;
    } catch (error) {
        return throwTypedApiError(error);
    }
}

export const getDoctorById = async (id: string): Promise<ApiResponse<IDoctorDetails>> => {
    try {
        const doctor = await httpClient.get<IDoctorDetails>(
            `/doctors/${id}`,
            { suppressErrorLog: true },
        );

        if (!doctor.success) {
            throw {
                success: false,
                message: doctor.message || "Failed to fetch doctor.",
            } satisfies ApiErrorResponse;
        }

        return doctor;
    } catch (error) {
        if (axios.isAxiosError<ApiErrorResponse>(error) && error.response?.data) {
            throw error.response.data;
        }

        throw error;
    }
}

export const createDoctor = async (payload: CreateDoctorPayload): Promise<ApiResponse<CreateDoctorResponseData>> => {
    try {
        const doctor = await httpClient.post<CreateDoctorResponseData>(
            "/users/create-doctor",
            payload,
            { suppressErrorLog: true },
        );

        if (!doctor.success) {
            throw {
                success: false,
                message: doctor.message || "Failed to create doctor.",
            } satisfies ApiErrorResponse;
        }

        return doctor;
    } catch (error) {
        if (axios.isAxiosError<ApiErrorResponse>(error) && error.response?.data) {
            throw error.response.data;
        }

        throw error;
    }
}

export const updateDoctor = async (id: string, payload: UpdateDoctorPayload): Promise<ApiResponse<IDoctor>> => {
    try {
        const doctor = await httpClient.patch<IDoctor>(
            `/doctors/${id}`,
            payload,
            { suppressErrorLog: true },
        );

        if (!doctor.success) {
            throw {
                success: false,
                message: doctor.message || "Failed to update doctor.",
            } satisfies ApiErrorResponse;
        }

        return doctor;
    } catch (error) {
        if (axios.isAxiosError<ApiErrorResponse>(error) && error.response?.data) {
            throw error.response.data;
        }

        throw error;
    }
}

export const deleteDoctor = async (id: string): Promise<ApiResponse<DeleteDoctorResponseData>> => {
    try {
        const response = await httpClient.delete<DeleteDoctorResponseData>(
            `/doctors/${id}`,
            { suppressErrorLog: true },
        );

        if (!response.success) {
            throw {
                success: false,
                message: response.message || "Failed to delete doctor.",
            } satisfies ApiErrorResponse;
        }

        return response;
    } catch (error) {
        if (axios.isAxiosError<ApiErrorResponse>(error) && error.response?.data) {
            throw error.response.data;
        }

        throw error;
    }
}
