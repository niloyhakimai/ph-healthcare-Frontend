"use server";
import { httpClient } from "@/lib/axios/httpClient";
import { ApiErrorResponse } from "@/types/api.types";
import { CreateDoctorPayload, CreateDoctorResponseData, IDoctor, UpdateDoctorPayload, DeleteDoctorResponseData } from "@/types/doctor.types";
import axios from "axios";

export const getDoctors = async (queryString?: string) => {
    try {
        const doctors = await httpClient.get<IDoctor[]>(queryString ? `/doctors?${queryString}` : "/doctors");
        return doctors;
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const getDoctorById = async (id: string) => {
    try {
        const doctor = await httpClient.get<IDoctor>(
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

export const createDoctor = async (payload: CreateDoctorPayload) => {
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

export const updateDoctor = async (id: string, payload: UpdateDoctorPayload) => {
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

export const deleteDoctor = async (id: string) => {
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
