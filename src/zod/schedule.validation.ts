import { ISchedule, CreateSchedulePayload, UpdateSchedulePayload } from "@/types/schedule.types";
import { format } from "date-fns";
import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const dateSchema = z
    .string()
    .trim()
    .min(1, "Date is required")
    .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00`)), {
        message: "Invalid date format",
    });

const timeSchema = z
    .string()
    .trim()
    .regex(timePattern, "Invalid time format");

const getTimeInMinutes = (value: string) => {
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
};

export const createScheduleFormSchema = z.object({
    startDate: dateSchema,
    endDate: dateSchema,
    startTime: timeSchema,
    endTime: timeSchema,
}).superRefine((value, ctx) => {
    if (value.endDate < value.startDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "End date cannot be earlier than start date",
            path: ["endDate"],
        });
    }

    if (getTimeInMinutes(value.endTime) <= getTimeInMinutes(value.startTime)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "End time must be later than start time",
            path: ["endTime"],
        });
    }
});

export type CreateScheduleFormValues = z.infer<typeof createScheduleFormSchema>;

export const defaultCreateScheduleFormValues: CreateScheduleFormValues = {
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
};

export const editScheduleFormSchema = z.object({
    date: dateSchema,
    startTime: timeSchema,
    endTime: timeSchema,
}).superRefine((value, ctx) => {
    if (getTimeInMinutes(value.endTime) <= getTimeInMinutes(value.startTime)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "End time must be later than start time",
            path: ["endTime"],
        });
    }
});

export type EditScheduleFormValues = z.infer<typeof editScheduleFormSchema>;

export const defaultEditScheduleFormValues: EditScheduleFormValues = {
    date: "",
    startTime: "",
    endTime: "",
};

export const mapCreateScheduleFormValuesToPayload = (
    values: CreateScheduleFormValues,
): CreateSchedulePayload => ({
    startDate: values.startDate.trim(),
    endDate: values.endDate.trim(),
    startTime: values.startTime.trim(),
    endTime: values.endTime.trim(),
});

export const mapEditScheduleFormValuesToPayload = (
    values: EditScheduleFormValues,
): UpdateSchedulePayload => ({
    startDate: values.date.trim(),
    endDate: values.date.trim(),
    startTime: values.startTime.trim(),
    endTime: values.endTime.trim(),
});

export const createEditScheduleFormValues = (
    schedule: Pick<ISchedule, "startDateTime" | "endDateTime">,
): EditScheduleFormValues => ({
    date: format(new Date(schedule.startDateTime), "yyyy-MM-dd"),
    startTime: format(new Date(schedule.startDateTime), "HH:mm"),
    endTime: format(new Date(schedule.endDateTime), "HH:mm"),
});
