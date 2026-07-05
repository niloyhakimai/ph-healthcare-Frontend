"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { createMyDoctorScheduleClient, getMyDoctorSchedulesClient } from "@/services/doctorSchedule.client";
import {
    getDoctorScheduleErrorDisplay,
    shouldRetryDoctorScheduleRequest,
} from "@/services/doctorSchedule.errors";
import { getSchedulesClient } from "@/services/schedule.client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Loader2, Search } from "lucide-react";
import React, { useMemo, useState } from "react";
import {
    formatDoctorScheduleDateTime,
    formatDoctorScheduleDuration,
    getDoctorScheduleSummaryLabel,
    getDoctorScheduleTimelineStatus,
    getDoctorScheduleTimelineStatusClassName,
    getDoctorScheduleTimelineStatusLabel,
    isUpcomingSchedule,
} from "./doctorScheduleUtils";

type ManageDoctorSchedulesSheetProps = {
    onSuccess?: (message: string) => void;
    disabled?: boolean;
    disabledReason?: string;
};

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
        return error.message;
    }

    return fallbackMessage;
};

const AVAILABLE_SCHEDULES_QUERY = "limit=200&sortBy=startDateTime&sortOrder=asc";
const MY_DOCTOR_SCHEDULES_QUERY = "limit=500&sortBy=createdAt&sortOrder=desc";

const ManageDoctorSchedulesSheet = ({
    disabled = false,
    disabledReason,
    onSuccess,
}: ManageDoctorSchedulesSheetProps) => {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [selectedScheduleIds, setSelectedScheduleIds] = useState<string[]>([]);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        data: availableSchedulesResponse,
        isLoading: isSchedulesLoading,
        isError: isAvailableSchedulesError,
        error: availableSchedulesError,
    } = useQuery({
        queryKey: ["available-admin-schedules", AVAILABLE_SCHEDULES_QUERY],
        queryFn: () => getSchedulesClient(AVAILABLE_SCHEDULES_QUERY),
        enabled: open,
    });

    const {
        data: myDoctorSchedulesResponse,
        isLoading: isMySchedulesLoading,
        isError: isMyDoctorSchedulesError,
        error: myDoctorSchedulesError,
    } = useQuery({
        queryKey: ["my-doctor-schedules", MY_DOCTOR_SCHEDULES_QUERY],
        queryFn: () => getMyDoctorSchedulesClient(MY_DOCTOR_SCHEDULES_QUERY),
        enabled: open,
        retry: shouldRetryDoctorScheduleRequest,
    });

    const myDoctorSchedulesQueryError = isMyDoctorSchedulesError
        ? getDoctorScheduleErrorDisplay(myDoctorSchedulesError)
        : null;
    const hasBlockingQueryError = isAvailableSchedulesError || isMyDoctorSchedulesError;

    const assignedScheduleIds = useMemo(
        () => new Set((myDoctorSchedulesResponse?.data ?? []).map((item) => item.scheduleId)),
        [myDoctorSchedulesResponse?.data],
    );

    const filteredSchedules = useMemo(() => {
        const normalizedSearchValue = searchValue.trim().toLowerCase();

        return (availableSchedulesResponse?.data ?? []).filter((schedule) => {
            if (!isUpcomingSchedule(schedule)) {
                return false;
            }

            if (assignedScheduleIds.has(schedule.id)) {
                return false;
            }

            if (!normalizedSearchValue) {
                return true;
            }

            return (
                schedule.id.toLowerCase().includes(normalizedSearchValue)
                || getDoctorScheduleSummaryLabel(schedule).toLowerCase().includes(normalizedSearchValue)
            );
        });
    }, [assignedScheduleIds, availableSchedulesResponse?.data, searchValue]);
    const totalSchedulesCount = availableSchedulesResponse?.data?.length ?? 0;
    const validSchedulesCount = useMemo(
        () => (availableSchedulesResponse?.data ?? []).filter((schedule) => isUpcomingSchedule(schedule)).length,
        [availableSchedulesResponse?.data],
    );
    const alreadyAssignedUpcomingCount = useMemo(
        () => (availableSchedulesResponse?.data ?? []).filter((schedule) =>
            isUpcomingSchedule(schedule) && assignedScheduleIds.has(schedule.id)).length,
        [assignedScheduleIds, availableSchedulesResponse?.data],
    );

    const { mutateAsync, isPending } = useMutation({
        mutationFn: createMyDoctorScheduleClient,
    });

    const clearState = () => {
        setSearchValue("");
        setSelectedScheduleIds([]);
        setServerError(null);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);

        if (!nextOpen) {
            clearState();
        }
    };

    const toggleScheduleSelection = (scheduleId: string, checked: boolean) => {
        setSelectedScheduleIds((currentValue) => {
            if (checked) {
                if (currentValue.includes(scheduleId)) {
                    return currentValue;
                }

                return [...currentValue, scheduleId];
            }

            return currentValue.filter((value) => value !== scheduleId);
        });
    };

    const handleSubmit = async () => {
        if (selectedScheduleIds.length === 0) {
            setServerError("Select at least one future schedule to add.");
            return;
        }

        setServerError(null);

        try {
            const response = await mutateAsync({
                scheduleIds: selectedScheduleIds,
            });

            const createdCount = Array.isArray(response.data) ? response.data.length : selectedScheduleIds.length;
            onSuccess?.(
                response.message
                || `Added ${createdCount} schedule slot${createdCount === 1 ? "" : "s"} successfully.`,
            );

            clearState();
            setOpen(false);

            await queryClient.invalidateQueries({ queryKey: ["my-doctor-schedules"] });
            await queryClient.invalidateQueries({ queryKey: ["available-admin-schedules"] });
        } catch (error) {
            setServerError(getErrorMessage(error, "Something went wrong while adding schedules."));
        }
    };

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                <Button disabled={disabled} title={disabledReason}>
                    <CalendarPlus className="size-4" />
                    Schedules
                </Button>
            </SheetTrigger>

            <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                <SheetHeader className="border-b">
                    <SheetTitle>Available Schedules</SheetTitle>
                    <SheetDescription>
                        Choose from today&apos;s and upcoming schedule slots created by admin. Past schedules are hidden.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 px-4 py-4">
                    {serverError && (
                        <Alert variant="destructive">
                            <AlertDescription>{serverError}</AlertDescription>
                        </Alert>
                    )}

                    {(isAvailableSchedulesError || isMyDoctorSchedulesError) && (
                        <Alert variant="destructive">
                            {myDoctorSchedulesQueryError && (
                                <AlertTitle>{myDoctorSchedulesQueryError.title}</AlertTitle>
                            )}
                            <AlertDescription>
                                {myDoctorSchedulesQueryError ? (
                                    <>
                                        <p>{myDoctorSchedulesQueryError.message}</p>
                                        {myDoctorSchedulesQueryError.hint && <p>{myDoctorSchedulesQueryError.hint}</p>}
                                    </>
                                ) : (
                                    getErrorMessage(
                                        availableSchedulesError ?? myDoctorSchedulesError,
                                        "Failed to load schedules. Please try again.",
                                    )
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            value={searchValue}
                            onChange={(event) => setSearchValue(event.target.value)}
                            placeholder="Search available schedules..."
                            className="pl-9"
                        />
                    </div>

                    {isSchedulesLoading || isMySchedulesLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <p>Loading available schedules...</p>
                            </div>
                        </div>
                    ) : hasBlockingQueryError ? (
                        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                            Schedules are unavailable right now. Resolve the error above, then try again.
                        </div>
                    ) : filteredSchedules.length > 0 ? (
                        <ScrollArea className="h-[420px] rounded-lg border">
                            <div className="space-y-3 p-4">
                                {filteredSchedules.map((schedule) => {
                                    const isSelected = selectedScheduleIds.includes(schedule.id);
                                    const timelineStatus = getDoctorScheduleTimelineStatus(schedule);

                                    return (
                                        <label
                                            key={schedule.id}
                                            className="flex cursor-pointer items-start gap-3 rounded-lg border p-4"
                                        >
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={(checked) => toggleScheduleSelection(schedule.id, checked === true)}
                                            />

                                            <div className="flex-1 space-y-2">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                    <div className="space-y-1">
                                                        <p className="font-medium">
                                                            {formatDoctorScheduleDateTime(schedule.startDateTime, "EEEE, MMM dd, yyyy")}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatDoctorScheduleDateTime(schedule.startDateTime, "hh:mm a")} -{" "}
                                                            {formatDoctorScheduleDateTime(schedule.endDateTime, "hh:mm a")}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium ${getDoctorScheduleTimelineStatusClassName(timelineStatus)}`}
                                                    >
                                                        {getDoctorScheduleTimelineStatusLabel(timelineStatus)}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                                                    <span className="font-mono text-xs">{schedule.id}</span>
                                                    <span>{formatDoctorScheduleDuration(schedule)}</span>
                                                </div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                            {totalSchedulesCount === 0
                                ? "No schedules have been created by admin yet."
                                : validSchedulesCount === 0
                                    ? "Schedules exist, but all of them are already in the past."
                                    : alreadyAssignedUpcomingCount === validSchedulesCount
                                        ? "All upcoming schedules are already added to your account."
                                        : "No upcoming schedules matched your current search."}
                        </div>
                    )}
                </div>

                <div className="border-t px-4 py-4">
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            {selectedScheduleIds.length} schedule{selectedScheduleIds.length === 1 ? "" : "s"} selected
                        </p>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={selectedScheduleIds.length === 0 || isPending || hasBlockingQueryError}
                                className="w-full sm:w-auto"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Adding Schedules...
                                    </>
                                ) : (
                                    "Add Selected Schedules"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default ManageDoctorSchedulesSheet;
