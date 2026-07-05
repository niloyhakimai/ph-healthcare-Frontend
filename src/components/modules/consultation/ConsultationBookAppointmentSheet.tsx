"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
    AppointmentBookingViewerRole,
    BookAppointmentSelection,
} from "@/types/appointment.types";
import { IDoctor } from "@/types/doctor.types";
import { CalendarDays, Clock3, Loader2, LogIn, Stethoscope } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
    buildBookAppointmentHref,
    buildBookAppointmentSelection,
    buildBookingLoginHref,
    formatAppointmentDateTime,
    formatAppointmentTimeRange,
} from "../appointments/appointmentUtils";
import {
    formatDoctorFee,
    getUpcomingOpenDoctorSchedules,
} from "./consultationDoctorUtils";

type ConsultationBookAppointmentSheetProps = {
    doctor: Pick<IDoctor, "id" | "name" | "designation" | "profilePhoto" | "appointmentFee" | "doctorSchedules">;
    viewerRole?: AppointmentBookingViewerRole;
    triggerLabel?: string;
    triggerVariant?: "default" | "outline" | "secondary" | "ghost";
    triggerClassName?: string;
};

const ConsultationBookAppointmentSheet = ({
    doctor,
    triggerClassName,
    triggerLabel = "Book Appointment",
    triggerVariant = "default",
    viewerRole = null,
}: ConsultationBookAppointmentSheetProps) => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
    const [isNavigating, startNavigation] = useTransition();

    const availableSchedules = useMemo(
        () => getUpcomingOpenDoctorSchedules(doctor),
        [doctor],
    );
    const selectedSchedule = useMemo(
        () => availableSchedules.find((schedule) => schedule.id === selectedScheduleId) ?? null,
        [availableSchedules, selectedScheduleId],
    );
    const isPatientViewer = viewerRole === "PATIENT";
    const isGuestViewer = viewerRole === null;
    const selection = selectedSchedule
        ? buildBookAppointmentSelection(doctor, selectedSchedule)
        : null;

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);

        if (!nextOpen) {
            setSelectedScheduleId(null);
        }
    };

    const handleProceed = (nextSelection: BookAppointmentSelection | null) => {
        if (!nextSelection) {
            toast.error("Select an available slot to continue.");
            return;
        }

        if (!isPatientViewer && !isGuestViewer) {
            toast.error("Only patient accounts can book appointments.");
            return;
        }

        const destinationHref = isPatientViewer
            ? buildBookAppointmentHref(nextSelection)
            : buildBookingLoginHref(nextSelection);

        startNavigation(() => {
            setOpen(false);
            router.push(destinationHref);
        });
    };

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                <Button variant={triggerVariant} className={triggerClassName}>
                    <CalendarDays className="size-4" />
                    {triggerLabel}
                </Button>
            </SheetTrigger>

            <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                <SheetHeader className="border-b">
                    <SheetTitle>Book Appointment with {doctor.name}</SheetTitle>
                    <SheetDescription>
                        Choose an available schedule slot from today onward to continue to the booking confirmation page.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 px-4 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="secondary" className="rounded-full px-3 py-1">
                            {doctor.designation || "Consultation specialist"}
                        </Badge>
                        <Badge variant="outline" className="rounded-full px-3 py-1">
                            {formatDoctorFee(doctor.appointmentFee)}
                        </Badge>
                        <Badge variant="outline" className="rounded-full px-3 py-1">
                            {availableSchedules.length} open slot{availableSchedules.length === 1 ? "" : "s"}
                        </Badge>
                    </div>

                    {isGuestViewer && (
                        <Alert>
                            <AlertTitle>Guest access is okay here</AlertTitle>
                            <AlertDescription>
                                You can review available slots now. We&apos;ll take you to log in before the final booking confirmation step.
                            </AlertDescription>
                        </Alert>
                    )}

                    {!isGuestViewer && !isPatientViewer && (
                        <Alert>
                            <AlertTitle>Patient account required</AlertTitle>
                            <AlertDescription>
                                This account can browse doctor availability, but only patient accounts can confirm and pay for appointments.
                            </AlertDescription>
                        </Alert>
                    )}

                    {availableSchedules.length > 0 ? (
                        <ScrollArea className="h-[420px] rounded-2xl border">
                            <div className="space-y-3 p-4">
                                {availableSchedules.map((doctorSchedule) => {
                                    const isSelected = selectedScheduleId === doctorSchedule.id;

                                    return (
                                        <button
                                            key={doctorSchedule.id}
                                            type="button"
                                            className={cn(
                                                "w-full rounded-2xl border p-4 text-left transition-colors",
                                                isSelected
                                                    ? "border-primary bg-primary/5 shadow-sm"
                                                    : "hover:border-primary/40 hover:bg-muted/20",
                                            )}
                                            onClick={() => setSelectedScheduleId(doctorSchedule.id)}
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                        <CalendarDays className="h-4 w-4" />
                                                        {formatAppointmentDateTime(
                                                            doctorSchedule.schedule?.startDateTime,
                                                            "EEEE, MMM dd, yyyy",
                                                        ) || "Date unavailable"}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Clock3 className="h-4 w-4" />
                                                        {formatAppointmentTimeRange(
                                                            doctorSchedule.schedule?.startDateTime,
                                                            doctorSchedule.schedule?.endDateTime,
                                                        ) || "Time unavailable"}
                                                    </div>
                                                </div>

                                                <Badge
                                                    variant={isSelected ? "default" : "outline"}
                                                    className="rounded-full px-3 py-1"
                                                >
                                                    {isSelected ? "Selected" : "Available"}
                                                </Badge>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="rounded-2xl border border-dashed bg-muted/10 px-6 py-12 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Stethoscope className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">No available schedules right now</h3>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                This doctor does not have any upcoming unbooked consultation slot published yet.
                            </p>
                        </div>
                    )}
                </div>

                <SheetFooter className="border-t">
                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-muted-foreground">
                            {selection ? (
                                <span>
                                    Selected:{" "}
                                    {formatAppointmentDateTime(selection.startDateTime, "MMM dd, yyyy")} •{" "}
                                    {formatAppointmentTimeRange(selection.startDateTime, selection.endDateTime)}
                                </span>
                            ) : (
                                "Choose one slot to continue"
                            )}
                        </div>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row">
                            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                onClick={() => handleProceed(selection)}
                                disabled={!selection || (!isGuestViewer && !isPatientViewer) || isNavigating}
                            >
                                {isNavigating ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Continuing...
                                    </>
                                ) : isGuestViewer ? (
                                    <>
                                        <LogIn className="size-4" />
                                        Log In to Continue
                                    </>
                                ) : (
                                    "Continue to Booking"
                                )}
                            </Button>
                        </div>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default ConsultationBookAppointmentSheet;
