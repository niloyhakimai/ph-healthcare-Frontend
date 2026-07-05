import { ApiResponse } from '@/types/api.types';
import axios from 'axios';
import { isTokenExpiringSoon } from '../tokenUtils';
import { cookies, headers } from 'next/headers';
import { getNewTokensWithRefreshToken } from '@/services/auth.services';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if(!API_BASE_URL) {
    throw new Error('API base URL is not defined in environment variables');
}


async function tryRefreshToken(
    accessToken: string,
    refreshToken: string
): Promise<void> {
    if (!(await isTokenExpiringSoon(accessToken))) {
        return;
    }

    const requestHeader = await headers();

    if(requestHeader.get("x-token-refreshed") === "1") {
        return;
    }

    try {
        await getNewTokensWithRefreshToken(refreshToken);
    } catch (error: unknown) {
        console.error("Error refreshing token in http client:", error);
    }
}


const axiosIntance = async (options?: ApiResponseOptions) => {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!options?.skipTokenRefresh && accessToken && refreshToken) {
        await tryRefreshToken(accessToken, refreshToken);
    }

    const cookieHeader = cookieStore
                                .getAll()
                                .map((cookie) => `${cookie.name}=${cookie.value}`)
                                 .join("; ");
    const instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000, // 3 seconds timeout
        headers: {
            'Content-Type': 'application/json',
            cookie : cookieHeader
        },
    });

    return instance;
}


export interface ApiResponseOptions {
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
    suppressErrorLog?: boolean;
    skipTokenRefresh?: boolean;
}

const httpGet = async <TData>(endpoint: string, options?: ApiResponseOptions) : Promise<ApiResponse <TData>> => {

    try {
        const instance = await axiosIntance(options);
        const response = await instance.get<ApiResponse<TData>>(endpoint, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        if (!options?.suppressErrorLog) {
            console.error(`GET request to ${endpoint} failed:`, error);
        }
        throw error;
    }
}

const httpPost = async <TData>(endpoint: string, data?: unknown, options?: ApiResponseOptions) : Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosIntance(options);
        const response = await instance.post<ApiResponse<TData>>(endpoint, data, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        if (!options?.suppressErrorLog) {
            console.error(`POST request to ${endpoint} failed:`, error);
        }
        throw error;
    }
}


const httpPut = async <TData>(endpoint: string, data?: unknown, options?: ApiResponseOptions) : Promise<ApiResponse<TData>>=> {
    try {
        const instance = await axiosIntance(options);
        const response = await instance.put<ApiResponse<TData>>(endpoint, data, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        if (!options?.suppressErrorLog) {
            console.error(`PUT request to ${endpoint} failed:`, error);
        }
        throw error;
    }
}

const httpPatch = async <TData>(endpoint: string, data?: unknown, options?: ApiResponseOptions) : Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosIntance(options);
        const response = await instance.patch<ApiResponse<TData>>(endpoint, data, { 
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;

    } catch (error) {
        if (!options?.suppressErrorLog) {
            console.error(`PATCH request to ${endpoint} failed:`, error);
        }
        throw error;
    }
}



const httpDelete = async <TData>(endpoint: string, options?: ApiResponseOptions) : Promise<ApiResponse<TData>>=> {
    try {
        const instance = await axiosIntance(options);
        const response = await instance.delete<ApiResponse<TData>>(endpoint, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        if (!options?.suppressErrorLog) {
            console.error(`DELETE request to ${endpoint} failed:`, error);
        }
        throw error;
    }
}

export const httpClient = {
    get: httpGet,
    post: httpPost,
    put: httpPut,
    patch: httpPatch,
    delete: httpDelete,
}
