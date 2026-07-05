"use client";

import DataTable from "@/components/shared/table/DataTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getSchedulesClient } from "@/services/schedule.client";
import { ISchedule } from "@/types/schedule.types";
import { useQuery } from "@tanstack/react-query";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import CreateScheduleSheet from "./CreateScheduleSheet";
import DeleteScheduleDialog from "./DeleteScheduleDialog";
import EditScheduleSheet from "./EditScheduleSheet";
import ScheduleDetailsDialog from "./ScheduleDetailsDialog";
import { getScheduleSummaryLabel } from "./scheduleUtils";
import { scheduleColumns, scheduleSortableColumnIds } from "./schedulesColumns";
import {
    buildSchedulesQueryStringFromSearchParams,
    DEFAULT_SCHEDULES_LIMIT,
    DEFAULT_SCHEDULES_PAGE,
    SCHEDULES_LIMIT_OPTIONS,
    SCHEDULES_SEARCH_QUERY_PARAM,
    parsePositiveIntegerParam,
} from "./schedulesQueryParams";

const SchedulesTable = () => {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [editScheduleId, setEditScheduleId] = useState<string | null>(null);
    const [viewScheduleId, setViewScheduleId] = useState<string | null>(null);
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
        () => buildSchedulesQueryStringFromSearchParams(searchParams),
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
            || !scheduleSortableColumnIds.includes(sortBy)
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

    const { data: schedulesResponse, isLoading } = useQuery({
        queryKey: ["schedules", queryString],
        queryFn: () => getSchedulesClient(queryString),
        placeholderData: (previousData) => previousData,
    });

    const schedules = schedulesResponse?.data ?? [];
    const paginationMeta = schedulesResponse?.meta;
    const searchTerm = normalizedSearchParams.get(SCHEDULES_SEARCH_QUERY_PARAM) ?? "";
    const totalRows = Number(paginationMeta?.total ?? schedules.length);
    const currentPage = parsePositiveIntegerParam(
        normalizedSearchParams.get("page"),
        paginationMeta?.page ?? DEFAULT_SCHEDULES_PAGE,
    );
    const currentLimit = parsePositiveIntegerParam(
        normalizedSearchParams.get("limit"),
        paginationMeta?.limit ?? DEFAULT_SCHEDULES_LIMIT,
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

    const replaceSchedulesUrl = (nextSearchParams: URLSearchParams) => {
        const nextQueryString = buildSchedulesQueryStringFromSearchParams(nextSearchParams);
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

        nextSearchParams.set("page", String(DEFAULT_SCHEDULES_PAGE));
        replaceSchedulesUrl(nextSearchParams);
    };

    const handlePaginationChange = (nextPaginationState: PaginationState) => {
        const nextSearchParams = new URLSearchParams(normalizedSearchParams.toString());

        nextSearchParams.set(
            "page",
            String(Math.max(nextPaginationState.pageIndex + 1, DEFAULT_SCHEDULES_PAGE)),
        );
        nextSearchParams.set(
            "limit",
            String(Math.max(nextPaginationState.pageSize, 1)),
        );

        replaceSchedulesUrl(nextSearchParams);
    };

    const handleSearchChange = (nextSearchTerm: string) => {
        const nextSearchParams = new URLSearchParams(normalizedSearchParams.toString());
        const trimmedSearchTerm = nextSearchTerm.trim();

        if (trimmedSearchTerm) {
            nextSearchParams.set(SCHEDULES_SEARCH_QUERY_PARAM, trimmedSearchTerm);
        } else {
            nextSearchParams.delete(SCHEDULES_SEARCH_QUERY_PARAM);
        }

        nextSearchParams.set("page", String(DEFAULT_SCHEDULES_PAGE));
        replaceSchedulesUrl(nextSearchParams);
    };

    const handleView = (schedule: ISchedule) => {
        setViewScheduleId(schedule.id);
    };

    const handleEdit = (schedule: ISchedule) => {
        setEditScheduleId(schedule.id);
    };

    const handleDelete = (schedule: ISchedule) => {
        setDeleteState({
            open: true,
            scheduleId: schedule.id,
            scheduleLabel: getScheduleSummaryLabel(schedule),
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight">Schedules</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage available schedule slots, update their timing, and remove outdated entries.
                    </p>
                </div>

                <CreateScheduleSheet
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

            <DataTable
                data={schedules}
                columns={scheduleColumns}
                isLoading={isLoading}
                emptyMessage="No schedules found."
                sorting={{
                    state: sortingState,
                    onSortingChange: handleSortingChange,
                }}
                pagination={{
                    state: paginationState,
                    onPaginationChange: handlePaginationChange,
                    pageCount,
                    totalRows,
                    limitOptions: SCHEDULES_LIMIT_OPTIONS,
                }}
                search={{
                    value: searchTerm,
                    onSearchChange: handleSearchChange,
                    placeholder: "Search schedules...",
                    debounceMs: 400,
                }}
                actions={{
                    onView: handleView,
                    onEdit: handleEdit,
                    onDelete: handleDelete,
                }}
            />

            <EditScheduleSheet
                scheduleId={editScheduleId}
                isOpen={!!editScheduleId}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditScheduleId(null);
                    }
                }}
                onSuccess={(message) => {
                    setSuccessMessage(message);
                }}
            />

            <DeleteScheduleDialog
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

            <ScheduleDetailsDialog
                scheduleId={viewScheduleId}
                isOpen={!!viewScheduleId}
                onOpenChange={(open) => {
                    if (!open) {
                        setViewScheduleId(null);
                    }
                }}
            />
        </div>
    );
};

export default SchedulesTable;
