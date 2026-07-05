type DoctorSchedulesQueryParamValue = string | string[] | undefined;

export type DoctorSchedulesQueryParams = Record<string, DoctorSchedulesQueryParamValue>;

export const DEFAULT_DOCTOR_SCHEDULES_PAGE = 1;
export const DEFAULT_DOCTOR_SCHEDULES_LIMIT = 10;
export const DOCTOR_SCHEDULES_LIMIT_OPTIONS = [10, 20, 50, 100] as const;
export const DOCTOR_SCHEDULES_SEARCH_QUERY_PARAM = "searchTerm";
export const DEFAULT_DOCTOR_SCHEDULES_SORT_BY = "createdAt";
export const DEFAULT_DOCTOR_SCHEDULES_SORT_ORDER = "desc";

interface SearchParamsLike {
    getAll(name: string): string[];
    keys(): IterableIterator<string>;
}

const appendQueryParam = (
    normalizedSearchParams: URLSearchParams,
    key: string,
    value: DoctorSchedulesQueryParamValue,
) => {
    if (typeof value === "undefined") {
        return;
    }

    if (Array.isArray(value)) {
        value.forEach((entry) => normalizedSearchParams.append(key, entry));
        return;
    }

    normalizedSearchParams.append(key, value);
};

const normalizeDoctorSchedulesSearchParams = (searchParams: URLSearchParams) => {
    const normalizedSearchParams = new URLSearchParams(searchParams.toString());
    const searchTerm = normalizedSearchParams.get(DOCTOR_SCHEDULES_SEARCH_QUERY_PARAM) ?? "";
    const sortBy = normalizedSearchParams.get("sortBy");
    const sortOrder = normalizedSearchParams.get("sortOrder");

    normalizedSearchParams.delete(DOCTOR_SCHEDULES_SEARCH_QUERY_PARAM);

    if (searchTerm.trim()) {
        normalizedSearchParams.set(DOCTOR_SCHEDULES_SEARCH_QUERY_PARAM, searchTerm.trim());
    }

    if (
        !sortBy
        || ![
            "createdAt",
            "isBooked",
        ].includes(sortBy)
        || (sortOrder !== "asc" && sortOrder !== "desc")
    ) {
        normalizedSearchParams.set("sortBy", DEFAULT_DOCTOR_SCHEDULES_SORT_BY);
        normalizedSearchParams.set("sortOrder", DEFAULT_DOCTOR_SCHEDULES_SORT_ORDER);
    }

    return normalizedSearchParams;
};

export const buildDoctorSchedulesQueryString = (queryParams: DoctorSchedulesQueryParams) => {
    const rawSearchParams = new URLSearchParams();

    Object.keys(queryParams)
        .sort()
        .forEach((key) => appendQueryParam(rawSearchParams, key, queryParams[key]));

    return normalizeDoctorSchedulesSearchParams(rawSearchParams).toString();
};

export const buildDoctorSchedulesQueryStringFromSearchParams = (
    searchParams: SearchParamsLike,
) => {
    const rawSearchParams = new URLSearchParams();
    const uniqueKeys = Array.from(new Set(Array.from(searchParams.keys()))).sort();

    uniqueKeys.forEach((key) => {
        searchParams.getAll(key).forEach((value) => {
            rawSearchParams.append(key, value);
        });
    });

    return normalizeDoctorSchedulesSearchParams(rawSearchParams).toString();
};

export const parsePositiveIntegerParam = (value: string | null, fallbackValue: number) => {
    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue < 1) {
        return fallbackValue;
    }

    return parsedValue;
};
