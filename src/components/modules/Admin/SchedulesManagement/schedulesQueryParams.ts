type SchedulesQueryParamValue = string | string[] | undefined;

export type SchedulesQueryParams = Record<string, SchedulesQueryParamValue>;

export const DEFAULT_SCHEDULES_PAGE = 1;
export const DEFAULT_SCHEDULES_LIMIT = 10;
export const SCHEDULES_LIMIT_OPTIONS = [10, 20, 50, 100] as const;
export const SCHEDULES_SEARCH_QUERY_PARAM = "searchTerm";
export const DEFAULT_SCHEDULES_SORT_BY = "startDateTime";
export const DEFAULT_SCHEDULES_SORT_ORDER = "asc";

interface SearchParamsLike {
    getAll(name: string): string[];
    keys(): IterableIterator<string>;
}

const appendQueryParam = (
    normalizedSearchParams: URLSearchParams,
    key: string,
    value: SchedulesQueryParamValue,
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

const normalizeSchedulesSearchParams = (searchParams: URLSearchParams) => {
    const normalizedSearchParams = new URLSearchParams(searchParams.toString());
    const searchTerm = normalizedSearchParams.get(SCHEDULES_SEARCH_QUERY_PARAM) ?? "";
    const sortBy = normalizedSearchParams.get("sortBy");
    const sortOrder = normalizedSearchParams.get("sortOrder");

    normalizedSearchParams.delete(SCHEDULES_SEARCH_QUERY_PARAM);

    if (searchTerm.trim()) {
        normalizedSearchParams.set(SCHEDULES_SEARCH_QUERY_PARAM, searchTerm.trim());
    }

    if (
        !sortBy
        || (sortBy !== "id" && sortBy !== "startDateTime" && sortBy !== "endDateTime")
        || (sortOrder !== "asc" && sortOrder !== "desc")
    ) {
        normalizedSearchParams.set("sortBy", DEFAULT_SCHEDULES_SORT_BY);
        normalizedSearchParams.set("sortOrder", DEFAULT_SCHEDULES_SORT_ORDER);
    }

    return normalizedSearchParams;
};

export const buildSchedulesQueryString = (queryParams: SchedulesQueryParams) => {
    const rawSearchParams = new URLSearchParams();

    Object.keys(queryParams)
        .sort()
        .forEach((key) => appendQueryParam(rawSearchParams, key, queryParams[key]));

    return normalizeSchedulesSearchParams(rawSearchParams).toString();
};

export const buildSchedulesQueryStringFromSearchParams = (
    searchParams: SearchParamsLike,
) => {
    const rawSearchParams = new URLSearchParams();
    const uniqueKeys = Array.from(new Set(Array.from(searchParams.keys()))).sort();

    uniqueKeys.forEach((key) => {
        searchParams.getAll(key).forEach((value) => {
            rawSearchParams.append(key, value);
        });
    });

    return normalizeSchedulesSearchParams(rawSearchParams).toString();
};

export const parsePositiveIntegerParam = (value: string | null, fallbackValue: number) => {
    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue < 1) {
        return fallbackValue;
    }

    return parsedValue;
};
