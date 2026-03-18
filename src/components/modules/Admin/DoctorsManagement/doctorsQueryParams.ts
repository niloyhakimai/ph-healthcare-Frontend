type DoctorsQueryParamValue = string | string[] | undefined;

export type DoctorsQueryParams = Record<string, DoctorsQueryParamValue>;
export const DEFAULT_DOCTORS_PAGE = 1;
export const DEFAULT_DOCTORS_LIMIT = 10;
export const DOCTORS_LIMIT_OPTIONS = [1, 10, 20, 50, 100] as const;
export const DOCTORS_SEARCH_QUERY_PARAM = "searchTerm";
export const LEGACY_DOCTORS_SEARCH_QUERY_PARAM = "searchterm";
export const DOCTORS_SPECIALTIES_QUERY_PARAM = "specialties.specialty.title";
export const LEGACY_DOCTORS_SPECIALTIES_QUERY_PARAM = "specialties";
export const DOCTORS_MIN_APPOINTMENT_FEE_QUERY_PARAM = "appointmentFee[gt]";
export const DOCTORS_MAX_APPOINTMENT_FEE_QUERY_PARAM = "appointmentFee[lt]";
export const DOCTORS_GENDER_QUERY_PARAM = "gender";
export const LEGACY_DOCTORS_MIN_APPOINTMENT_FEE_QUERY_PARAM = "minAppointmentFee";
export const LEGACY_DOCTORS_MAX_APPOINTMENT_FEE_QUERY_PARAM = "maxAppointmentFee";

interface SearchParamsLike {
    getAll(name: string): string[];
    keys(): IterableIterator<string>;
}

const appendQueryParam = (
    normalizedSearchParams: URLSearchParams,
    key: string,
    value: DoctorsQueryParamValue,
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

const normalizeDoctorsUrlSearchParams = (searchParams: URLSearchParams) => {
    const normalizedSearchParams = new URLSearchParams(searchParams.toString());

    const searchTerm =
        normalizedSearchParams.get(DOCTORS_SEARCH_QUERY_PARAM)
        ?? normalizedSearchParams.get(LEGACY_DOCTORS_SEARCH_QUERY_PARAM)
        ?? "";

    normalizedSearchParams.delete(DOCTORS_SEARCH_QUERY_PARAM);
    normalizedSearchParams.delete(LEGACY_DOCTORS_SEARCH_QUERY_PARAM);

    if (searchTerm.trim()) {
        normalizedSearchParams.set(DOCTORS_SEARCH_QUERY_PARAM, searchTerm.trim());
    }

    const minAppointmentFee =
        normalizedSearchParams.get(DOCTORS_MIN_APPOINTMENT_FEE_QUERY_PARAM)
        ?? normalizedSearchParams.get(LEGACY_DOCTORS_MIN_APPOINTMENT_FEE_QUERY_PARAM)
        ?? "";
    const maxAppointmentFee =
        normalizedSearchParams.get(DOCTORS_MAX_APPOINTMENT_FEE_QUERY_PARAM)
        ?? normalizedSearchParams.get(LEGACY_DOCTORS_MAX_APPOINTMENT_FEE_QUERY_PARAM)
        ?? "";

    normalizedSearchParams.delete(DOCTORS_MIN_APPOINTMENT_FEE_QUERY_PARAM);
    normalizedSearchParams.delete(DOCTORS_MAX_APPOINTMENT_FEE_QUERY_PARAM);
    normalizedSearchParams.delete(LEGACY_DOCTORS_MIN_APPOINTMENT_FEE_QUERY_PARAM);
    normalizedSearchParams.delete(LEGACY_DOCTORS_MAX_APPOINTMENT_FEE_QUERY_PARAM);

    if (minAppointmentFee.trim()) {
        normalizedSearchParams.set(DOCTORS_MIN_APPOINTMENT_FEE_QUERY_PARAM, minAppointmentFee.trim());
    }

    if (maxAppointmentFee.trim()) {
        normalizedSearchParams.set(DOCTORS_MAX_APPOINTMENT_FEE_QUERY_PARAM, maxAppointmentFee.trim());
    }

    return normalizedSearchParams;
};

export const buildDoctorsQueryString = (queryParams: DoctorsQueryParams) => {
    const rawSearchParams = new URLSearchParams();

    Object.keys(queryParams)
        .sort()
        .forEach((key) => appendQueryParam(rawSearchParams, key, queryParams[key]));

    return normalizeDoctorsUrlSearchParams(rawSearchParams).toString();
};

export const buildDoctorsQueryStringFromSearchParams = (
    searchParams: SearchParamsLike,
) => {
    const rawSearchParams = new URLSearchParams();
    const uniqueKeys = Array.from(new Set(Array.from(searchParams.keys()))).sort();

    uniqueKeys.forEach((key) => {
        searchParams.getAll(key).forEach((value) => {
            rawSearchParams.append(key, value);
        });
    });

    return normalizeDoctorsUrlSearchParams(rawSearchParams).toString();
};

export const parsePositiveIntegerParam = (value: string | null, fallbackValue: number) => {
    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue < 1) {
        return fallbackValue;
    }

    return parsedValue;
};
