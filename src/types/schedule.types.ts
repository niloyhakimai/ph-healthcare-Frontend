export interface ISchedule {
    id: string;
    startDateTime: string;
    endDateTime: string;
    createdAt?: string;
    updatedAt?: string;
    appointments?: unknown[];
    doctorSchedules?: unknown[];
}

export interface CreateSchedulePayload {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
}

export interface UpdateSchedulePayload {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
}
