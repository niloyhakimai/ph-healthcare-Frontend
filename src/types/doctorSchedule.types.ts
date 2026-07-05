import { ISchedule } from "./schedule.types";

export interface IDoctorSchedule {
    id: string;
    doctorId: string;
    scheduleId: string;
    isBooked: boolean;
    createdAt: string;
    updatedAt: string;
    schedule: ISchedule;
    doctor?: {
        id: string;
        name?: string;
        email?: string;
        user?: {
            status?: string;
        };
    };
}

export interface CreateMyDoctorSchedulePayload {
    scheduleIds: string[];
}
