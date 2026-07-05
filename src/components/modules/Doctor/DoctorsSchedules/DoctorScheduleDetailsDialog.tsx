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
import { IDoctorSchedule } from "@/types/doctorSchedule.types";
import React from "react";
import {
    formatDoctorScheduleDateTime,
    formatDoctorScheduleDuration,
    getDoctorScheduleBookingStatusClassName,
    getDoctorScheduleBookingStatusLabel,
    getDoctorScheduleTimelineStatus,
    getDoctorScheduleTimelineStatusClassName,
    getDoctorScheduleTimelineStatusLabel,
} from "./doctorScheduleUtils";

type DoctorScheduleDetailsDialogProps = {
    doctorSchedule: IDoctorSchedule | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
};

const DoctorScheduleDetailsDialog = ({
    doctorSchedule,
    isOpen,
    onOpenChange,
}: DoctorScheduleDetailsDialogProps) => {
    const timelineStatus = doctorSchedule ? getDoctorScheduleTimelineStatus(doctorSchedule) : null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                <SheetHeader className="mb-4 border-b">
                    <SheetTitle>My Schedule Details</SheetTitle>
                    <SheetDescription>
                        Review the selected schedule slot and its current booking state.
                    </SheetDescription>
                </SheetHeader>

                {!doctorSchedule || !timelineStatus ? (
                    <div className="py-4 text-center text-muted-foreground">
                        Schedule details are not available.
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-semibold tracking-tight">Schedule Slot</h2>
                                <p className="break-all font-mono text-xs text-muted-foreground">
                                    {doctorSchedule.scheduleId}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Badge className={getDoctorScheduleTimelineStatusClassName(timelineStatus)}>
                                    {getDoctorScheduleTimelineStatusLabel(timelineStatus)}
                                </Badge>
                                <Badge className={getDoctorScheduleBookingStatusClassName(doctorSchedule.isBooked)}>
                                    {getDoctorScheduleBookingStatusLabel(doctorSchedule.isBooked)}
                                </Badge>
                            </div>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Timing Overview</CardTitle>
                                <CardDescription>
                                    Core date and time information for this slot.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Date</p>
                                    <p className="font-medium">
                                        {formatDoctorScheduleDateTime(
                                            doctorSchedule.schedule.startDateTime,
                                            "EEEE, MMM dd, yyyy",
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Duration</p>
                                    <p className="font-medium">{formatDoctorScheduleDuration(doctorSchedule)}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Exact Date and Time</CardTitle>
                                <CardDescription>
                                    These are the saved timestamps for this doctor schedule.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Starts At</p>
                                    <p className="font-medium">
                                        {formatDoctorScheduleDateTime(
                                            doctorSchedule.schedule.startDateTime,
                                            "MMM dd, yyyy hh:mm a",
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Ends At</p>
                                    <p className="font-medium">
                                        {formatDoctorScheduleDateTime(
                                            doctorSchedule.schedule.endDateTime,
                                            "MMM dd, yyyy hh:mm a",
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Assigned On</p>
                                    <p className="font-medium">
                                        {formatDoctorScheduleDateTime(doctorSchedule.createdAt, "MMM dd, yyyy hh:mm a")}
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

export default DoctorScheduleDetailsDialog;
