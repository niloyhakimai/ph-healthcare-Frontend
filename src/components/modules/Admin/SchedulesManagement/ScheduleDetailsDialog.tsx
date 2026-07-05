"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { getScheduleByIdClient } from "@/services/schedule.client";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React from "react";
import {
    formatScheduleDateTime,
    formatScheduleDuration,
    getScheduleTimelineStatus,
    getScheduleTimelineStatusClassName,
    getScheduleTimelineStatusLabel,
} from "./scheduleUtils";

type ScheduleDetailsDialogProps = {
    scheduleId: string | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
};

const ScheduleDetailsDialog = ({ scheduleId, isOpen, onOpenChange }: ScheduleDetailsDialogProps) => {
    const { data: scheduleResponse, isLoading } = useQuery({
        queryKey: ["schedule", scheduleId],
        queryFn: () => (scheduleId ? getScheduleByIdClient(scheduleId) : Promise.resolve(null)),
        enabled: isOpen && !!scheduleId,
    });

    const schedule = scheduleResponse?.data;
    const timelineStatus = schedule ? getScheduleTimelineStatus(schedule) : null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                <SheetHeader className="mb-4 border-b">
                    <SheetTitle>Schedule Details</SheetTitle>
                    <SheetDescription>Review the date, time, and current timeline state of this slot.</SheetDescription>
                </SheetHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p>Loading schedule details...</p>
                        </div>
                    </div>
                ) : !schedule || !timelineStatus ? (
                    <div className="py-4 text-center text-muted-foreground">
                        Failed to load schedule information.
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-semibold tracking-tight">Schedule Slot</h2>
                                <p className="break-all font-mono text-xs text-muted-foreground">
                                    {schedule.id}
                                </p>
                            </div>

                            <Badge className={getScheduleTimelineStatusClassName(timelineStatus)}>
                                {getScheduleTimelineStatusLabel(timelineStatus)}
                            </Badge>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Timing Overview</CardTitle>
                                <CardDescription>
                                    A quick summary of this schedule slot.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Date</p>
                                    <p className="font-medium">
                                        {formatScheduleDateTime(schedule.startDateTime, "EEEE, MMM dd, yyyy")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Duration</p>
                                    <p className="font-medium">{formatScheduleDuration(schedule)}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Exact Date and Time</CardTitle>
                                <CardDescription>
                                    These are the saved timestamps for this slot.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Starts At</p>
                                    <p className="font-medium">
                                        {formatScheduleDateTime(schedule.startDateTime, "MMM dd, yyyy hh:mm a")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Ends At</p>
                                    <p className="font-medium">
                                        {formatScheduleDateTime(schedule.endDateTime, "MMM dd, yyyy hh:mm a")}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default ScheduleDetailsDialog;
