import { Badge } from "@/components/ui/badge";
import { IDoctorSchedule } from "@/types/doctorSchedule.types";
import { ColumnDef } from "@tanstack/react-table";
import {
    formatDoctorScheduleDateTime,
    formatDoctorScheduleDuration,
    getDoctorScheduleBookingStatusClassName,
    getDoctorScheduleBookingStatusLabel,
    getDoctorScheduleTimelineStatus,
    getDoctorScheduleTimelineStatusClassName,
    getDoctorScheduleTimelineStatusLabel,
} from "./doctorScheduleUtils";

export const doctorScheduleSortableColumnIds: ReadonlyArray<string> = [
    "createdAt",
    "isBooked",
] as const;

export const doctorSchedulesColumns: ColumnDef<IDoctorSchedule>[] = [
    {
        id: "scheduleId",
        accessorKey: "scheduleId",
        enableSorting: false,
        header: "Schedule ID",
        cell: ({ row }) => (
            <div className="max-w-44">
                <p
                    className="truncate font-mono text-xs text-card-foreground sm:text-sm"
                    title={row.original.scheduleId}
                >
                    {row.original.scheduleId}
                </p>
            </div>
        ),
    },
    {
        id: "schedule.startDateTime",
        accessorFn: (row) => row.schedule?.startDateTime,
        enableSorting: false,
        header: "Starts At",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="text-sm font-medium">
                    {formatDoctorScheduleDateTime(row.original.schedule.startDateTime, "MMM dd, yyyy")}
                </span>
                <span className="text-xs text-muted-foreground">
                    {formatDoctorScheduleDateTime(row.original.schedule.startDateTime, "hh:mm a")}
                </span>
            </div>
        ),
    },
    {
        id: "schedule.endDateTime",
        accessorFn: (row) => row.schedule?.endDateTime,
        enableSorting: false,
        header: "Ends At",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="text-sm font-medium">
                    {formatDoctorScheduleDateTime(row.original.schedule.endDateTime, "MMM dd, yyyy")}
                </span>
                <span className="text-xs text-muted-foreground">
                    {formatDoctorScheduleDateTime(row.original.schedule.endDateTime, "hh:mm a")}
                </span>
            </div>
        ),
    },
    {
        id: "duration",
        enableSorting: false,
        header: "Duration",
        cell: ({ row }) => (
            <span className="text-sm">{formatDoctorScheduleDuration(row.original)}</span>
        ),
    },
    {
        id: "createdAt",
        accessorKey: "createdAt",
        header: "Added On",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="text-sm font-medium">
                    {formatDoctorScheduleDateTime(row.original.createdAt, "MMM dd, yyyy")}
                </span>
                <span className="text-xs text-muted-foreground">
                    {formatDoctorScheduleDateTime(row.original.createdAt, "hh:mm a")}
                </span>
            </div>
        ),
    },
    {
        id: "timeline",
        enableSorting: false,
        header: "Timeline",
        cell: ({ row }) => {
            const status = getDoctorScheduleTimelineStatus(row.original);

            return (
                <Badge className={getDoctorScheduleTimelineStatusClassName(status)}>
                    {getDoctorScheduleTimelineStatusLabel(status)}
                </Badge>
            );
        },
    },
    {
        id: "isBooked",
        accessorKey: "isBooked",
        header: "Booking Status",
        cell: ({ row }) => (
            <Badge className={getDoctorScheduleBookingStatusClassName(row.original.isBooked)}>
                {getDoctorScheduleBookingStatusLabel(row.original.isBooked)}
            </Badge>
        ),
    },
];
