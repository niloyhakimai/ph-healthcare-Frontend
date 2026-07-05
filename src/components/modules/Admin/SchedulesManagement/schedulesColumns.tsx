import { Badge } from "@/components/ui/badge";
import { ISchedule } from "@/types/schedule.types";
import { ColumnDef } from "@tanstack/react-table";
import {
    formatScheduleDateTime,
    formatScheduleDuration,
    getScheduleTimelineStatus,
    getScheduleTimelineStatusClassName,
    getScheduleTimelineStatusLabel,
} from "./scheduleUtils";

export const scheduleSortableColumnIds: ReadonlyArray<string> = [
    "id",
    "startDateTime",
    "endDateTime",
] as const;

export const scheduleColumns: ColumnDef<ISchedule>[] = [
    {
        id: "id",
        accessorKey: "id",
        header: "Schedule ID",
        cell: ({ row }) => (
            <div className="max-w-44">
                <p
                    className="truncate font-mono text-xs text-card-foreground sm:text-sm"
                    title={row.original.id}
                >
                    {row.original.id}
                </p>
            </div>
        ),
    },
    {
        id: "startDateTime",
        accessorKey: "startDateTime",
        header: "Starts At",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="text-sm font-medium">
                    {formatScheduleDateTime(row.original.startDateTime, "MMM dd, yyyy")}
                </span>
                <span className="text-xs text-muted-foreground">
                    {formatScheduleDateTime(row.original.startDateTime, "hh:mm a")}
                </span>
            </div>
        ),
    },
    {
        id: "endDateTime",
        accessorKey: "endDateTime",
        header: "Ends At",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="text-sm font-medium">
                    {formatScheduleDateTime(row.original.endDateTime, "MMM dd, yyyy")}
                </span>
                <span className="text-xs text-muted-foreground">
                    {formatScheduleDateTime(row.original.endDateTime, "hh:mm a")}
                </span>
            </div>
        ),
    },
    {
        id: "duration",
        enableSorting: false,
        header: "Duration",
        cell: ({ row }) => (
            <span className="text-sm">
                {formatScheduleDuration(row.original)}
            </span>
        ),
    },
    {
        id: "status",
        enableSorting: false,
        header: "Timeline",
        cell: ({ row }) => {
            const status = getScheduleTimelineStatus(row.original);

            return (
                <Badge className={getScheduleTimelineStatusClassName(status)}>
                    {getScheduleTimelineStatusLabel(status)}
                </Badge>
            );
        },
    },
];
