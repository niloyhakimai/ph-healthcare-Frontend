"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ISpecialty } from "@/types/specialty.types";

export const getSpecialties = async () => {
    try {
        const specialties = await httpClient.get<ISpecialty[]>("/specialties");
        return specialties;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
