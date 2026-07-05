import { cn } from "@/lib/utils";
import { ISchedule } from "@/types/schedule.types";
import { differenceInMinutes, format } from "date-fns";

export type ScheduleTimelineStatus = "UPCOMING" | "ONGOING" | "COMPLETED";

const toDate = (value: string | Date) => new Date(value);

const isValidDate = (value: Date) => !Number.isNaN(value.getTime());

export const formatScheduleDateTime = (
    value: string | Date,
    formatString = "MMM dd, yyyy hh:mm a",
) => {
    const dateValue = toDate(value);

    if (!isValidDate(dateValue)) {
        return "-";
    }

    return format(dateValue, formatString);
};

export const getScheduleDurationInMinutes = (
    schedule: Pick<ISchedule, "startDateTime" | "endDateTime">,
) => {
    const startDate = toDate(schedule.startDateTime);
    const endDate = toDate(schedule.endDateTime);

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
        return null;
    }

    return Math.max(differenceInMinutes(endDate, startDate), 0);
};

export const formatScheduleDuration = (
    schedule: Pick<ISchedule, "startDateTime" | "endDateTime">,
) => {
    const duration = getScheduleDurationInMinutes(schedule);

    if (duration === null) {
        return "-";
    }

    return `${duration} min`;
};

export const getScheduleTimelineStatus = (
    schedule: Pick<ISchedule, "startDateTime" | "endDateTime">,
    now = new Date(),
): ScheduleTimelineStatus => {
    const startDate = toDate(schedule.startDateTime);
    const endDate = toDate(schedule.endDateTime);

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
        return "UPCOMING";
    }

    if (now < startDate) {
        return "UPCOMING";
    }

    if (now >= endDate) {
        return "COMPLETED";
    }

    return "ONGOING";
};

export const getScheduleTimelineStatusLabel = (status: ScheduleTimelineStatus) => {
    switch (status) {
        case "ONGOING":
            return "Ongoing";
        case "COMPLETED":
            return "Completed";
        default:
            return "Upcoming";
    }
};

export const getScheduleTimelineStatusClassName = (status: ScheduleTimelineStatus) => {
    switch (status) {
        case "ONGOING":
            return cn(
                "border-transparent bg-amber-100 text-amber-800",
                "dark:bg-amber-500/20 dark:text-amber-300",
            );
        case "COMPLETED":
            return cn(
                "border-transparent bg-slate-200 text-slate-700",
                "dark:bg-slate-500/20 dark:text-slate-300",
            );
        default:
            return cn(
                "border-transparent bg-emerald-100 text-emerald-800",
                "dark:bg-emerald-500/20 dark:text-emerald-300",
            );
    }
};

export const getScheduleSummaryLabel = (
    schedule: Pick<ISchedule, "startDateTime" | "endDateTime">,
) => {
    const dateLabel = formatScheduleDateTime(schedule.startDateTime, "MMM dd, yyyy");
    const startLabel = formatScheduleDateTime(schedule.startDateTime, "hh:mm a");
    const endLabel = formatScheduleDateTime(schedule.endDateTime, "hh:mm a");

    return `${dateLabel} | ${startLabel} - ${endLabel}`;
};
