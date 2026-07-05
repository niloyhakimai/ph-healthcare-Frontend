"use client";

import DataTable from "@/components/shared/table/DataTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getMyDoctorSchedulesClient } from "@/services/doctorSchedule.client";
import {
    getDoctorScheduleErrorDisplay,
    shouldRetryDoctorScheduleRequest,
} from "@/services/doctorSchedule.errors";
import { IDoctorSchedule } from "@/types/doctorSchedule.types";
import { useQuery } from "@tanstack/react-query";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import DeleteDoctorScheduleDialog from "./DeleteDoctorScheduleDialog";
import DoctorScheduleDetailsDialog from "./DoctorScheduleDetailsDialog";
import { doctorSchedulesColumns, doctorScheduleSortableColumnIds } from "./doctorSchedulesColumns";
import {
    buildDoctorSchedulesQueryStringFromSearchParams,
    DEFAULT_DOCTOR_SCHEDULES_LIMIT,
    DEFAULT_DOCTOR_SCHEDULES_PAGE,
    DOCTOR_SCHEDULES_LIMIT_OPTIONS,
    DOCTOR_SCHEDULES_SEARCH_QUERY_PARAM,
    parsePositiveIntegerParam,
} from "./doctorSchedulesQueryParams";
import { getDoctorScheduleSummaryLabel } from "./doctorScheduleUtils";
import ManageDoctorSchedulesSheet from "./ManageDoctorSchedulesSheet";

const DoctorShedulesTable = () => {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [viewDoctorSchedule, setViewDoctorSchedule] = useState<IDoctorSchedule | null>(null);
    const [deleteState, setDeleteState] = useState<{
        open: boolean;
        scheduleId: string | null;
        scheduleLabel: string | null;
    }>({
        open: false,
        scheduleId: null,
        scheduleLabel: null,
    });

    const queryString = useMemo(
        () => buildDoctorSchedulesQueryStringFromSearchParams(searchParams),
        [searchParams],
    );
    const normalizedSearchParams = useMemo(
        () => new URLSearchParams(queryString),
        [queryString],
    );

    const sortingState = useMemo<SortingState>(() => {
        const sortBy = normalizedSearchParams.get("sortBy");
        const sortOrder = normalizedSearchParams.get("sortOrder");

        if (
            !sortBy
            || !doctorScheduleSortableColumnIds.includes(sortBy)
            || (sortOrder !== "asc" && sortOrder !== "desc")
        ) {
            return [];
        }

        return [
            {
                id: sortBy,
                desc: sortOrder === "desc",
            },
        ];
    }, [normalizedSearchParams]);

    const {
        data: doctorSchedulesResponse,
        error,
        isError,
        isLoading,
    } = useQuery({
        queryKey: ["my-doctor-schedules", queryString],
        queryFn: () => getMyDoctorSchedulesClient(queryString),
        placeholderData: (previousData) => previousData,
        retry: shouldRetryDoctorScheduleRequest,
    });

    const doctorSchedules = doctorSchedulesResponse?.data ?? [];
    const doctorSchedulesError = isError ? getDoctorScheduleErrorDisplay(error) : null;
    const isDoctorProfileMissing = doctorSchedulesError?.isDoctorProfileMissing ?? false;
    const paginationMeta = doctorSchedulesResponse?.meta;
    const searchTerm = normalizedSearchParams.get(DOCTOR_SCHEDULES_SEARCH_QUERY_PARAM) ?? "";
    const isAssignedSchedulesEmpty = !isLoading && !isError && doctorSchedules.length === 0 && !searchTerm;
    const shouldRenderTable = !doctorSchedulesError || doctorSchedules.length > 0;
    const totalRows = Number(paginationMeta?.total ?? doctorSchedules.length);
    const currentPage = parsePositiveIntegerParam(
        normalizedSearchParams.get("page"),
        paginationMeta?.page ?? DEFAULT_DOCTOR_SCHEDULES_PAGE,
    );
    const currentLimit = parsePositiveIntegerParam(
        normalizedSearchParams.get("limit"),
        paginationMeta?.limit ?? DEFAULT_DOCTOR_SCHEDULES_LIMIT,
    );
    const pageCount = Math.max(
        Number(paginationMeta?.totalPages ?? paginationMeta?.totalPage ?? 0)
        || (totalRows > 0 ? Math.ceil(totalRows / currentLimit) : 0),
        totalRows > 0 ? 1 : 0,
    );

    const paginationState = useMemo<PaginationState>(() => ({
        pageIndex: Math.max(currentPage - 1, 0),
        pageSize: currentLimit,
    }), [currentLimit, currentPage]);

    useEffect(() => {
        if (searchParams.toString() === queryString) {
            return;
        }

        const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
        router.replace(nextUrl, { scroll: false });
    }, [pathname, queryString, router, searchParams]);

    const replaceDoctorSchedulesUrl = (nextSearchParams: URLSearchParams) => {
        const nextQueryString = buildDoctorSchedulesQueryStringFromSearchParams(nextSearchParams);
        const nextUrl = nextQueryString ? `${pathname}?${nextQueryString}` : pathname;

        router.replace(nextUrl, { scroll: false });
    };

    const handleSortingChange = (nextSortingState: SortingState) => {
        const nextSearchParams = new URLSearchParams(normalizedSearchParams.toString());
        const [nextSort] = nextSortingState;

        if (!nextSort) {
            nextSearchParams.delete("sortBy");
            nextSearchParams.delete("sortOrder");
        } else {
            nextSearchParams.set("sortBy", nextSort.id);
            nextSearchParams.set("sortOrder", nextSort.desc ? "desc" : "asc");
        }

        nextSearchParams.set("page", String(DEFAULT_DOCTOR_SCHEDULES_PAGE));
        replaceDoctorSchedulesUrl(nextSearchParams);
    };

    const handlePaginationChange = (nextPaginationState: PaginationState) => {
        const nextSearchParams = new URLSearchParams(normalizedSearchParams.toString());

        nextSearchParams.set(
            "page",
            String(Math.max(nextPaginationState.pageIndex + 1, DEFAULT_DOCTOR_SCHEDULES_PAGE)),
        );
        nextSearchParams.set(
            "limit",
            String(Math.max(nextPaginationState.pageSize, 1)),
        );

        replaceDoctorSchedulesUrl(nextSearchParams);
    };

    const handleSearchChange = (nextSearchTerm: string) => {
        const nextSearchParams = new URLSearchParams(normalizedSearchParams.toString());
        const trimmedSearchTerm = nextSearchTerm.trim();

        if (trimmedSearchTerm) {
            nextSearchParams.set(DOCTOR_SCHEDULES_SEARCH_QUERY_PARAM, trimmedSearchTerm);
        } else {
            nextSearchParams.delete(DOCTOR_SCHEDULES_SEARCH_QUERY_PARAM);
        }

        nextSearchParams.set("page", String(DEFAULT_DOCTOR_SCHEDULES_PAGE));
        replaceDoctorSchedulesUrl(nextSearchParams);
    };

    const handleView = (doctorSchedule: IDoctorSchedule) => {
        setViewDoctorSchedule(doctorSchedule);
    };

    const handleDelete = (doctorSchedule: IDoctorSchedule) => {
        if (doctorSchedule.isBooked) {
            toast.error("Booked schedules cannot be removed.");
            return;
        }

        setDeleteState({
            open: true,
            scheduleId: doctorSchedule.scheduleId,
            scheduleLabel: getDoctorScheduleSummaryLabel(doctorSchedule),
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight">My Schedules</h2>
                    <p className="text-sm text-muted-foreground">
                        View schedules assigned to your doctor profile and add new upcoming slots created by admin.
                    </p>
                </div>

                <ManageDoctorSchedulesSheet
                    disabled={isDoctorProfileMissing}
                    disabledReason="A linked doctor profile is required before schedules can be assigned."
                    onSuccess={(message) => {
                        setSuccessMessage(message);
                    }}
                />
            </div>

            {successMessage && (
                <Alert>
                    <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
            )}

            {doctorSchedulesError && (
                <Alert variant="destructive">
                    <AlertTitle>{doctorSchedulesError.title}</AlertTitle>
                    <AlertDescription>
                        <p>{doctorSchedulesError.message}</p>
                        {doctorSchedulesError.hint && <p>{doctorSchedulesError.hint}</p>}
                    </AlertDescription>
                </Alert>
            )}

            {isAssignedSchedulesEmpty && (
                <Alert>
                    <AlertTitle>No schedules assigned yet</AlertTitle>
                    <AlertDescription>
                        <p>Only schedule slots assigned to your doctor profile appear here.</p>
                        <p>Use the Schedules button to add upcoming slots that an admin has already created.</p>
                    </AlertDescription>
                </Alert>
            )}

            {shouldRenderTable && (
                <DataTable
                    data={doctorSchedules}
                    columns={doctorSchedulesColumns}
                    isLoading={isLoading}
                    emptyMessage={searchTerm ? "No schedules matched your search." : "No schedules assigned yet."}
                    sorting={{
                        state: sortingState,
                        onSortingChange: handleSortingChange,
                    }}
                    pagination={{
                        state: paginationState,
                        onPaginationChange: handlePaginationChange,
                        pageCount,
                        totalRows,
                        limitOptions: DOCTOR_SCHEDULES_LIMIT_OPTIONS,
                    }}
                    search={{
                        value: searchTerm,
                        onSearchChange: handleSearchChange,
                        placeholder: "Search your schedules...",
                        debounceMs: 400,
                    }}
                    actions={{
                        onView: handleView,
                        onDelete: handleDelete,
                    }}
                />
            )}

            <DeleteDoctorScheduleDialog
                scheduleId={deleteState.scheduleId}
                scheduleLabel={deleteState.scheduleLabel}
                isOpen={deleteState.open}
                onOpenChange={(open) => {
                    setDeleteState((prev) => ({
                        ...prev,
                        open,
                    }));
                }}
            />

            <DoctorScheduleDetailsDialog
                doctorSchedule={viewDoctorSchedule}
                isOpen={!!viewDoctorSchedule}
                onOpenChange={(open) => {
                    if (!open) {
                        setViewDoctorSchedule(null);
                    }
                }}
            />
        </div>
    );
};

export default DoctorShedulesTable;
