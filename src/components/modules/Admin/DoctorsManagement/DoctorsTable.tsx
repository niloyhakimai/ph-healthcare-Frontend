'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { DataTableFilterConfig, DataTableRangeValue } from '@/components/shared/table/DataTableFilters'
import { Gender, IDoctor } from '@/types/doctor.types'
import DataTable from '@/components/shared/table/DataTable'
import { doctorColumns, doctorSortableColumnIds } from './doctorsColumns'
import { useQuery } from '@tanstack/react-query'
import { getDoctors } from '@/services/doctor.services'
import { getSpecialties } from '@/services/specialty.services'
import { ISpecialty } from '@/types/specialty.types'
import { ColumnFiltersState, PaginationState, SortingState } from '@tanstack/react-table'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
    buildDoctorsQueryStringFromSearchParams,
    DEFAULT_DOCTORS_LIMIT,
    DEFAULT_DOCTORS_PAGE,
    DOCTORS_GENDER_QUERY_PARAM,
    DOCTORS_LIMIT_OPTIONS,
    DOCTORS_SEARCH_QUERY_PARAM,
    DOCTORS_MAX_APPOINTMENT_FEE_QUERY_PARAM,
    DOCTORS_MIN_APPOINTMENT_FEE_QUERY_PARAM,
    DOCTORS_SPECIALTIES_QUERY_PARAM,
    LEGACY_DOCTORS_MAX_APPOINTMENT_FEE_QUERY_PARAM,
    LEGACY_DOCTORS_MIN_APPOINTMENT_FEE_QUERY_PARAM,
    LEGACY_DOCTORS_SEARCH_QUERY_PARAM,
    LEGACY_DOCTORS_SPECIALTIES_QUERY_PARAM,
    parsePositiveIntegerParam,
} from './doctorsQueryParams'
import { Alert, AlertDescription } from '@/components/ui/alert'
import CreateDoctorSheet from './CreateDoctorSheet'
import EditDoctorSheet from './EditDoctorSheet'
import DeleteDoctorDialog from './DeleteDoctorDialog'
import DoctorDetailsDialog from './DoctorDetailsDialog'

const DoctorsTable = () => {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [editDoctorId, setEditDoctorId] = useState<string | null>(null);
    const [viewDoctorId, setViewDoctorId] = useState<string | null>(null);
    const [deleteState, setDeleteState] = useState<{
        open: boolean;
        doctorId: string | null;
        doctorName: string | null;
    }>({
        open: false,
        doctorId: null,
        doctorName: null,
    });

    const sortingState = useMemo<SortingState>(() => {
        const sortBy = searchParams.get("sortBy");
        const sortOrder = searchParams.get("sortOrder");

        if (
            !sortBy ||
            !doctorSortableColumnIds.includes(sortBy) ||
            (sortOrder !== "asc" && sortOrder !== "desc")
        ) {
            return [];
        }

        return [
            {
                id: sortBy,
                desc: sortOrder === "desc",
            },
        ];
    }, [searchParams]);

    const { data: specialtiesResponse } = useQuery({
        queryKey: ["specialties"],
        queryFn: getSpecialties,
    });
    const specialties = specialtiesResponse?.data ?? [];
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

        return nextSearchParams;
    }, [searchParams, specialties]);
    const queryString = useMemo(
        () => buildDoctorsQueryStringFromSearchParams(normalizedSearchParams),
        [normalizedSearchParams],
    );
    const currentUrlQueryString = useMemo(
        () => buildDoctorsQueryStringFromSearchParams(searchParams),
        [searchParams],
    );
    const searchTerm = normalizedSearchParams.get(DOCTORS_SEARCH_QUERY_PARAM) ?? "";
    const specialtyFilterValues = useMemo(() => {
        return normalizedSearchParams.getAll(DOCTORS_SPECIALTIES_QUERY_PARAM).filter(Boolean);
    }, [normalizedSearchParams]);
    const genderFilterValue = normalizedSearchParams.get(DOCTORS_GENDER_QUERY_PARAM) ?? "";
    const minAppointmentFee =
        normalizedSearchParams.get(DOCTORS_MIN_APPOINTMENT_FEE_QUERY_PARAM)
        ?? "";
    const maxAppointmentFee =
        normalizedSearchParams.get(DOCTORS_MAX_APPOINTMENT_FEE_QUERY_PARAM)
        ?? "";
    const { data: doctorDataResponse, isLoading } = useQuery({
        queryKey: ["doctors", queryString],
        queryFn: () => getDoctors(queryString),
        placeholderData: (previousData) => previousData,
    });
    const doctors = doctorDataResponse?.data ?? [];
    const paginationMeta = doctorDataResponse?.meta;
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

        nextSearchParams.set("page", String(DEFAULT_DOCTORS_PAGE));
        replaceDoctorsUrl(nextSearchParams);
    };

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

    const handleView = (doctor: IDoctor) => {
        setViewDoctorId(doctor.id as string);
    }
    
    const handleEdit = (doctor: IDoctor) => {
        setEditDoctorId(doctor.id as string);
    }
    
    const handleDelete = (doctor: IDoctor) => {
        setDeleteState({
            open: true,
            doctorId: doctor.id as string,
            doctorName: doctor.name,
        });
    }

  return (
       <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight">Doctors</h2>
                <p className="text-sm text-muted-foreground">
                    Manage doctor profiles, specialties, and availability from one place.
                </p>
            </div>

            <CreateDoctorSheet
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
            data={doctors}
            columns={doctorColumns}
            isLoading={isLoading}
            emptyMessage='No doctors found.'
            sorting={{
                state: sortingState,
                onSortingChange: handleSortingChange,
            }}
            pagination={{
                state: paginationState,
                onPaginationChange: handlePaginationChange,
                pageCount,
                totalRows,
                limitOptions: DOCTORS_LIMIT_OPTIONS,
            }}
            search={{
                value: searchTerm,
                onSearchChange: handleSearchChange,
                placeholder: "Search doctors...",
                debounceMs: 400,
            }}
            filters={{
                state: filtersState,
                onFiltersChange: handleFiltersChange,
                configs: filterConfigs,
            }}
            actions={
                {
                    onView : handleView,
                    onEdit : handleEdit,
                    onDelete : handleDelete
                }
            }
        />
        
        <EditDoctorSheet
            doctorId={editDoctorId}
            isOpen={!!editDoctorId}
            onOpenChange={(open) => {
                if (!open) {
                    setEditDoctorId(null);
                }
            }}
            onSuccess={(message) => {
                setSuccessMessage(message);
            }}
        />

        <DeleteDoctorDialog
            doctorId={deleteState.doctorId}
            doctorName={deleteState.doctorName}
            isOpen={deleteState.open}
            onOpenChange={(open) => {
                setDeleteState((prev) => ({
                    ...prev,
                    open,
                }));
            }}
            onConfirmDelete={() => {
                // Table will automatically refresh due to query invalidation
            }}
        />

        <DoctorDetailsDialog
            doctorId={viewDoctorId}
            isOpen={!!viewDoctorId}
            onOpenChange={(open) => {
                if (!open) {
                    setViewDoctorId(null);
                }
            }}
        />
       </div>
  )
}

export default DoctorsTable
