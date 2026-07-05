"use client";

import { DataTableFilterConfig, DataTableRangeValue } from "@/components/shared/table/DataTableFilters";
import DataTableFilters from "@/components/shared/table/DataTableFilters";
import DataTablePagination from "@/components/shared/table/DataTablePagination";
import DataTableSearch from "@/components/shared/table/DataTableSearch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getDoctors } from "@/services/doctor.services";
import { getSpecialties } from "@/services/specialty.services";
import { AppointmentBookingViewerRole } from "@/types/appointment.types";
import { Gender, IDoctor } from "@/types/doctor.types";
import { ISpecialty } from "@/types/specialty.types";
import { useQuery } from "@tanstack/react-query";
import {
    ColumnDef,
    ColumnFiltersState,
    PaginationState,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { SearchX, SlidersHorizontal, Stethoscope } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import ConsultationDoctorCard from "./ConsultationDoctorCard";
import { appendDoctorIncludeQuery, getErrorMessage } from "./consultationDoctorUtils";
import {
    buildDoctorsQueryStringFromSearchParams,
    DEFAULT_DOCTORS_LIMIT,
    DEFAULT_DOCTORS_PAGE,
    DOCTORS_GENDER_QUERY_PARAM,
    DOCTORS_LIMIT_OPTIONS,
    DOCTORS_MAX_APPOINTMENT_FEE_QUERY_PARAM,
    DOCTORS_MIN_APPOINTMENT_FEE_QUERY_PARAM,
    DOCTORS_SEARCH_QUERY_PARAM,
    DOCTORS_SPECIALTIES_QUERY_PARAM,
    LEGACY_DOCTORS_MAX_APPOINTMENT_FEE_QUERY_PARAM,
    LEGACY_DOCTORS_MIN_APPOINTMENT_FEE_QUERY_PARAM,
    LEGACY_DOCTORS_SEARCH_QUERY_PARAM,
    LEGACY_DOCTORS_SPECIALTIES_QUERY_PARAM,
    parsePositiveIntegerParam,
} from "../Admin/DoctorsManagement/doctorsQueryParams";

const cardGridColumns: ColumnDef<IDoctor>[] = [];

const SORT_OPTIONS = [
    { value: "averageRating:desc", label: "Recommended" },
    { value: "name:asc", label: "Name (A-Z)" },
    { value: "experience:desc", label: "Most experienced" },
    { value: "appointmentFee:asc", label: "Lowest fee" },
    { value: "appointmentFee:desc", label: "Highest fee" },
    { value: "createdAt:desc", label: "Newest profiles" },
] as const;

type DoctorsListProps = {
    viewerRole?: AppointmentBookingViewerRole;
};

const DoctorsList = ({ viewerRole = null }: DoctorsListProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const { data: specialtiesResponse } = useQuery({
        queryKey: ["specialties"],
        queryFn: getSpecialties,
        staleTime: 1000 * 60 * 10,
    });
    const specialties = useMemo(
        () => specialtiesResponse?.data ?? [],
        [specialtiesResponse?.data],
    );

    const normalizedSearchParams = useMemo(() => {
        const nextSearchParams = new URLSearchParams(searchParams.toString());
        const rawSearchTerm =
            searchParams.get(DOCTORS_SEARCH_QUERY_PARAM)
            ?? searchParams.get(LEGACY_DOCTORS_SEARCH_QUERY_PARAM)
            ?? "";
        const rawMinAppointmentFee =
            searchParams.get(DOCTORS_MIN_APPOINTMENT_FEE_QUERY_PARAM)
            ?? searchParams.get(LEGACY_DOCTORS_MIN_APPOINTMENT_FEE_QUERY_PARAM)
            ?? "";
        const rawMaxAppointmentFee =
            searchParams.get(DOCTORS_MAX_APPOINTMENT_FEE_QUERY_PARAM)
            ?? searchParams.get(LEGACY_DOCTORS_MAX_APPOINTMENT_FEE_QUERY_PARAM)
            ?? "";
        const canonicalSpecialtyTitles = searchParams.getAll(DOCTORS_SPECIALTIES_QUERY_PARAM).filter(Boolean);
        const legacySpecialtyIds = searchParams.getAll(LEGACY_DOCTORS_SPECIALTIES_QUERY_PARAM).filter(Boolean);
        const resolvedSpecialtyTitles = canonicalSpecialtyTitles.length > 0
            ? canonicalSpecialtyTitles
            : legacySpecialtyIds
                .map((specialtyId) => specialties.find((specialty) => specialty.id === specialtyId)?.title ?? "")
                .filter(Boolean);

        nextSearchParams.delete(DOCTORS_SEARCH_QUERY_PARAM);
        nextSearchParams.delete(LEGACY_DOCTORS_SEARCH_QUERY_PARAM);
        nextSearchParams.delete(DOCTORS_MIN_APPOINTMENT_FEE_QUERY_PARAM);
        nextSearchParams.delete(DOCTORS_MAX_APPOINTMENT_FEE_QUERY_PARAM);
        nextSearchParams.delete(LEGACY_DOCTORS_MIN_APPOINTMENT_FEE_QUERY_PARAM);
        nextSearchParams.delete(LEGACY_DOCTORS_MAX_APPOINTMENT_FEE_QUERY_PARAM);
        nextSearchParams.delete(DOCTORS_SPECIALTIES_QUERY_PARAM);
        nextSearchParams.delete(LEGACY_DOCTORS_SPECIALTIES_QUERY_PARAM);

        if (rawSearchTerm.trim()) {
            nextSearchParams.set(DOCTORS_SEARCH_QUERY_PARAM, rawSearchTerm.trim());
        }

        if (rawMinAppointmentFee.trim()) {
            nextSearchParams.set(DOCTORS_MIN_APPOINTMENT_FEE_QUERY_PARAM, rawMinAppointmentFee.trim());
        }

        if (rawMaxAppointmentFee.trim()) {
            nextSearchParams.set(DOCTORS_MAX_APPOINTMENT_FEE_QUERY_PARAM, rawMaxAppointmentFee.trim());
        }

        resolvedSpecialtyTitles.forEach((specialtyTitle) => {
            nextSearchParams.append(DOCTORS_SPECIALTIES_QUERY_PARAM, specialtyTitle);
        });

        const sortBy = nextSearchParams.get("sortBy");
        const sortOrder = nextSearchParams.get("sortOrder");

        if (!sortBy || (sortOrder !== "asc" && sortOrder !== "desc")) {
            nextSearchParams.set("sortBy", "averageRating");
            nextSearchParams.set("sortOrder", "desc");
        }

        return nextSearchParams;
    }, [searchParams, specialties]);

    const queryString = useMemo(
        () => buildDoctorsQueryStringFromSearchParams(normalizedSearchParams),
        [normalizedSearchParams],
    );
    const apiQueryString = useMemo(
        () => appendDoctorIncludeQuery(queryString, "doctorSchedules"),
        [queryString],
    );
    const currentUrlQueryString = useMemo(
        () => buildDoctorsQueryStringFromSearchParams(searchParams),
        [searchParams],
    );
    const searchTerm = normalizedSearchParams.get(DOCTORS_SEARCH_QUERY_PARAM) ?? "";
    const specialtyFilterValues = useMemo(
        () => normalizedSearchParams.getAll(DOCTORS_SPECIALTIES_QUERY_PARAM).filter(Boolean),
        [normalizedSearchParams],
    );
    const genderFilterValue = normalizedSearchParams.get(DOCTORS_GENDER_QUERY_PARAM) ?? "";
    const minAppointmentFee = normalizedSearchParams.get(DOCTORS_MIN_APPOINTMENT_FEE_QUERY_PARAM) ?? "";
    const maxAppointmentFee = normalizedSearchParams.get(DOCTORS_MAX_APPOINTMENT_FEE_QUERY_PARAM) ?? "";
    const selectedSortValue = `${normalizedSearchParams.get("sortBy") ?? "averageRating"}:${normalizedSearchParams.get("sortOrder") ?? "desc"}`;

    const {
        data: doctorsResponse,
        error,
        isError,
        isLoading,
    } = useQuery({
        queryKey: ["doctors", apiQueryString],
        queryFn: () => getDoctors(apiQueryString),
        placeholderData: (previousData) => previousData,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

    const doctors = doctorsResponse?.data ?? [];
    const paginationMeta = doctorsResponse?.meta;
    const totalRows = Number(paginationMeta?.total ?? doctors.length);
    const currentPage = parsePositiveIntegerParam(
        normalizedSearchParams.get("page"),
        paginationMeta?.page ?? DEFAULT_DOCTORS_PAGE,
    );
    const currentLimit = parsePositiveIntegerParam(
        normalizedSearchParams.get("limit"),
        paginationMeta?.limit ?? DEFAULT_DOCTORS_LIMIT,
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

    const filtersState = useMemo<ColumnFiltersState>(() => {
        const nextFilters: ColumnFiltersState = [];

        if (specialtyFilterValues.length > 0) {
            nextFilters.push({
                id: "specialtiesFilter",
                value: specialtyFilterValues,
            });
        }

        if (minAppointmentFee || maxAppointmentFee) {
            nextFilters.push({
                id: "appointmentFeeRange",
                value: {
                    min: minAppointmentFee,
                    max: maxAppointmentFee,
                },
            });
        }

        if (genderFilterValue) {
            nextFilters.push({
                id: "genderFilter",
                value: genderFilterValue,
            });
        }

        return nextFilters;
    }, [genderFilterValue, maxAppointmentFee, minAppointmentFee, specialtyFilterValues]);

    const filterConfigs = useMemo<DataTableFilterConfig[]>(() => [
        {
            id: "specialtiesFilter",
            label: "Specialties",
            type: "multi-select",
            options: specialties
                .map((specialty: ISpecialty) => ({
                    label: specialty.title,
                    value: specialty.title,
                }))
                .sort((left, right) => left.label.localeCompare(right.label)),
            emptyMessage: "No specialties found.",
            debounceMs: 700,
        },
        {
            id: "appointmentFeeRange",
            label: "Appointment Fee",
            type: "range",
            minPlaceholder: "Minimum fee",
            maxPlaceholder: "Maximum fee",
            debounceMs: 700,
        },
        {
            id: "genderFilter",
            label: "Gender",
            type: "single-select",
            options: [
                { label: "Male", value: Gender.MALE },
                { label: "Female", value: Gender.FEMALE },
                { label: "Other", value: Gender.OTHER },
            ],
        },
    ], [specialties]);

    const replaceDoctorsUrl = (nextSearchParams: URLSearchParams) => {
        const nextQueryString = buildDoctorsQueryStringFromSearchParams(nextSearchParams);
        const nextUrl = nextQueryString ? `${pathname}?${nextQueryString}` : pathname;

        router.replace(nextUrl, { scroll: false });
    };

    useEffect(() => {
        if (currentUrlQueryString === queryString) {
            return;
        }

        const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
        router.replace(nextUrl, { scroll: false });
    }, [currentUrlQueryString, pathname, queryString, router]);

    const handlePaginationChange = (nextPaginationState: PaginationState) => {
        const nextSearchParams = new URLSearchParams(normalizedSearchParams.toString());

        nextSearchParams.set(
            "page",
            String(Math.max(nextPaginationState.pageIndex + 1, DEFAULT_DOCTORS_PAGE)),
        );
        nextSearchParams.set(
            "limit",
            String(Math.max(nextPaginationState.pageSize, 1)),
        );

        replaceDoctorsUrl(nextSearchParams);
    };

    const handleSearchChange = (nextSearchTerm: string) => {
        const nextSearchParams = new URLSearchParams(normalizedSearchParams.toString());
        const normalizedSearchTerm = nextSearchTerm.trim();

        if (normalizedSearchTerm) {
            nextSearchParams.set(DOCTORS_SEARCH_QUERY_PARAM, normalizedSearchTerm);
        } else {
            nextSearchParams.delete(DOCTORS_SEARCH_QUERY_PARAM);
        }

        nextSearchParams.set("page", String(DEFAULT_DOCTORS_PAGE));
        replaceDoctorsUrl(nextSearchParams);
    };

    const handleFiltersChange = (nextFiltersState: ColumnFiltersState) => {
        const nextSearchParams = new URLSearchParams(normalizedSearchParams.toString());
        const specialtiesFilter = nextFiltersState.find((filter) => filter.id === "specialtiesFilter");
        const appointmentFeeFilter = nextFiltersState.find((filter) => filter.id === "appointmentFeeRange");
        const genderFilter = nextFiltersState.find((filter) => filter.id === "genderFilter");

        nextSearchParams.delete(DOCTORS_SPECIALTIES_QUERY_PARAM);
        nextSearchParams.delete(DOCTORS_MIN_APPOINTMENT_FEE_QUERY_PARAM);
        nextSearchParams.delete(DOCTORS_MAX_APPOINTMENT_FEE_QUERY_PARAM);
        nextSearchParams.delete(DOCTORS_GENDER_QUERY_PARAM);

        if (Array.isArray(specialtiesFilter?.value)) {
            specialtiesFilter.value
                .map(String)
                .filter(Boolean)
                .forEach((value) => {
                    nextSearchParams.append(DOCTORS_SPECIALTIES_QUERY_PARAM, value);
                });
        }

        if (appointmentFeeFilter?.value && typeof appointmentFeeFilter.value === "object") {
            const rangeValue = appointmentFeeFilter.value as DataTableRangeValue;
            const minValue = rangeValue.min?.trim();
            const maxValue = rangeValue.max?.trim();

            if (minValue) {
                nextSearchParams.set(DOCTORS_MIN_APPOINTMENT_FEE_QUERY_PARAM, minValue);
            }

            if (maxValue) {
                nextSearchParams.set(DOCTORS_MAX_APPOINTMENT_FEE_QUERY_PARAM, maxValue);
            }
        }

        if (typeof genderFilter?.value === "string" && genderFilter.value.trim()) {
            nextSearchParams.set(DOCTORS_GENDER_QUERY_PARAM, genderFilter.value.trim());
        }

        nextSearchParams.set("page", String(DEFAULT_DOCTORS_PAGE));
        replaceDoctorsUrl(nextSearchParams);
    };

    const table = useReactTable({
        data: doctors,
        columns: cardGridColumns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualFiltering: true,
        pageCount,
        rowCount: totalRows,
        state: {
            pagination: paginationState,
            globalFilter: searchTerm,
            columnFilters: filtersState,
        },
        onPaginationChange: (updater) => {
            const nextPaginationState = typeof updater === "function"
                ? updater(paginationState)
                : updater;

            handlePaginationChange(nextPaginationState);
        },
        onGlobalFilterChange: (updater) => {
            const nextGlobalFilter = typeof updater === "function"
                ? updater(searchTerm)
                : updater;

            handleSearchChange(String(nextGlobalFilter ?? ""));
        },
        onColumnFiltersChange: (updater) => {
            const nextFiltersState = typeof updater === "function"
                ? updater(filtersState)
                : updater;

            handleFiltersChange(nextFiltersState);
        },
    });

    const hasActiveFilters = Boolean(
        searchTerm
        || specialtyFilterValues.length > 0
        || genderFilterValue
        || minAppointmentFee
        || maxAppointmentFee,
    );

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-6 lg:px-8">
            <section className="overflow-hidden rounded-3xl border bg-gradient-to-br from-sky-50 via-background to-emerald-50">
                <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-end lg:justify-between lg:p-8">
                    <div className="max-w-3xl space-y-4">
                        <Badge variant="secondary" className="rounded-full px-3 py-1">
                            Public Consultation
                        </Badge>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                Find the Right Doctor for Your Consultation
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                                Explore specialists, compare experience and consultation fees, and open each profile for contact details and patient reviews.
                            </p>
                        </div>
                    </div>

                    <Card className="min-w-full py-0 shadow-sm lg:min-w-72">
                        <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-1">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Doctors Available
                                </p>
                                <p className="mt-2 text-3xl font-semibold">{totalRows}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Specialties
                                </p>
                                <p className="mt-2 text-3xl font-semibold">{specialties.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section className="rounded-3xl border bg-card">
                <div className="flex flex-col gap-4 border-b px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <SlidersHorizontal className="h-4 w-4" />
                            Search, filter, and sort doctors
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Narrow the list by specialty, fee range, gender, or search keywords.
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-56">
                        <span className="text-sm font-medium text-muted-foreground">Sort by</span>
                        <Select
                            value={selectedSortValue}
                            onValueChange={(value) => {
                                const [sortBy, sortOrder] = value.split(":");
                                const nextSearchParams = new URLSearchParams(normalizedSearchParams.toString());

                                nextSearchParams.set("sortBy", sortBy);
                                nextSearchParams.set("sortOrder", sortOrder);
                                nextSearchParams.set("page", String(DEFAULT_DOCTORS_PAGE));
                                replaceDoctorsUrl(nextSearchParams);
                            }}
                        >
                            <SelectTrigger className="w-full lg:w-56">
                                <SelectValue placeholder="Sort doctors" />
                            </SelectTrigger>
                            <SelectContent>
                                {SORT_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-b px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <DataTableSearch
                        table={table}
                        placeholder="Search doctors by name, designation, workplace, qualification, or specialty..."
                        debounceMs={400}
                    />

                    <DataTableFilters
                        table={table}
                        configs={filterConfigs}
                    />
                </div>

                <div className="px-4 py-5">
                    {isLoading ? (
                        <div className="flex min-h-72 items-center justify-center rounded-2xl border bg-muted/15">
                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                <Stethoscope className="h-7 w-7 animate-pulse" />
                                <p>Loading doctors...</p>
                            </div>
                        </div>
                    ) : isError ? (
                        <Alert variant="destructive">
                            <AlertTitle>Unable to load doctors</AlertTitle>
                            <AlertDescription>
                                {getErrorMessage(error, "The doctor consultation list could not be loaded right now.")}
                            </AlertDescription>
                        </Alert>
                    ) : doctors.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {doctors.map((doctor) => (
                                <ConsultationDoctorCard
                                    key={doctor.id}
                                    doctor={doctor}
                                    viewerRole={viewerRole}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/10 px-6 text-center">
                            <div className="rounded-full bg-muted p-3">
                                <SearchX className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">No doctors found</h3>
                            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                                {hasActiveFilters
                                    ? "No doctor matched your current search or filter combination. Try widening the fee range, changing specialties, or clearing filters."
                                    : "There are no public doctor profiles available at the moment."}
                            </p>
                        </div>
                    )}
                </div>

                {!isError && (
                    <DataTablePagination
                        table={table}
                        totalRows={totalRows}
                        currentRowCount={doctors.length}
                        limitOptions={DOCTORS_LIMIT_OPTIONS}
                        itemLabel="doctors"
                        pageSizeLabel="Doctors per page"
                    />
                )}
            </section>
        </div>
    );
};

export default DoctorsList;
