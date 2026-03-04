"use server";
import { httpClient } from "@/lib/axios/httpClient";


interface IDoctor {
    id: number;
    name: string;
    specialization: string;
    experience: number;
    rating: number;
}

export const getDoctors = async () => {
    const doctors = await httpClient.get<IDoctor[]>('/doctors');
    console.log(doctors, "server");
    return doctors;
}