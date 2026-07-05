import { cn } from "@/lib/utils";
import { IDoctorSchedule } from "@/types/doctorSchedule.types";
import { ISchedule } from "@/types/schedule.types";
import { differenceInMinutes, format } from "date-fns";

type ScheduleLike = Pick<ISchedule, "startDateTime" | "endDateTime">;
type DoctorScheduleLike = Pick<IDoctorSchedule, "schedule">;

export type DoctorScheduleTimelineStatus = "UPCOMING" | "ONGOING" | "COMPLETED";

const resolveSchedule = (value: ScheduleLike | DoctorScheduleLike): ScheduleLike =>
    "schedule" in value ? value.schedule : value;

const toDate = (value: string | Date) => new Date(value);

const isValidDate = (value: Date) => !Number.isNaN(value.getTime());

export const formatDoctorScheduleDateTime = (
    value: string | Date,
    formatString = "MMM dd, yyyy hh:mm a",
) => {
    const dateValue = toDate(value);

    if (!isValidDate(dateValue)) {
        return "-";
    }

    return format(dateValue, formatString);
};

export const formatDoctorScheduleDuration = (value: ScheduleLike | DoctorScheduleLike) => {
    const schedule = resolveSchedule(value);
    const startDate = toDate(schedule.startDateTime);
    const endDate = toDate(schedule.endDateTime);

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
        return "-";
    }

    return `${Math.max(differenceInMinutes(endDate, startDate), 0)} min`;
};

export const getDoctorScheduleTimelineStatus = (
    value: ScheduleLike | DoctorScheduleLike,
    now = new Date(),
): DoctorScheduleTimelineStatus => {
    const schedule = resolveSchedule(value);
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

export const getDoctorScheduleTimelineStatusLabel = (status: DoctorScheduleTimelineStatus) => {
    switch (status) {
        case "ONGOING":
            return "Ongoing";
        case "COMPLETED":
            return "Completed";
        default:
            return "Upcoming";
    }
};

export const getDoctorScheduleTimelineStatusClassName = (status: DoctorScheduleTimelineStatus) => {
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

export const getDoctorScheduleBookingStatusLabel = (isBooked: boolean) =>
    isBooked ? "Booked" : "Open";

export const getDoctorScheduleBookingStatusClassName = (isBooked: boolean) =>
    isBooked
        ? cn(
            "border-transparent bg-rose-100 text-rose-800",
            "dark:bg-rose-500/20 dark:text-rose-300",
        )
        : cn(
            "border-transparent bg-sky-100 text-sky-800",
            "dark:bg-sky-500/20 dark:text-sky-300",
        );

export const getDoctorScheduleSummaryLabel = (value: ScheduleLike | DoctorScheduleLike) => {
    const schedule = resolveSchedule(value);

    return `${formatDoctorScheduleDateTime(schedule.startDateTime, "MMM dd, yyyy")} | ${formatDoctorScheduleDateTime(schedule.startDateTime, "hh:mm a")} - ${formatDoctorScheduleDateTime(schedule.endDateTime, "hh:mm a")}`;
};

export const isUpcomingSchedule = (schedule: ScheduleLike, now = new Date()) => {
    const endDate = toDate(schedule.endDateTime);

    if (!isValidDate(endDate)) {
        return false;
    }

    return endDate >= now;
};
