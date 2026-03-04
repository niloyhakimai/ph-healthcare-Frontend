import { ApiResponse } from '@/types/api.types';
import axios from 'axios';
import { tr } from 'date-fns/locale';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if(!API_BASE_URL) {
    throw new Error('API base URL is not defined in environment variables');
}


const axiosIntance = () => {
    const instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000, // 3 seconds timeout
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return instance;
}


export interface ApiResponseOptions {
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
}

const httpGet = async <TData>(endpoint: string, options?: ApiResponseOptions) : Promise<ApiResponse <TData>> => {

    try {
        const instance = axiosIntance();
        const response = await instance.get<ApiResponse<TData>>(endpoint, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`GET request to ${endpoint} failed:`, error);
        throw error;
    }
}

const httpPost = async <TData>(endpoint: string, data?: unknown, options?: ApiResponseOptions) : Promise<ApiResponse<TData>> => {
    try {
        const response = await axiosIntance().post<ApiResponse<TData>>(endpoint, data, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`POST request to ${endpoint} failed:`, error);
        throw error;
    }
}


const httpPut = async <TData>(endpoint: string, data?: unknown, options?: ApiResponseOptions) : Promise<ApiResponse<TData>>=> {
    try {
        const response = await axiosIntance().put<ApiResponse<TData>>(endpoint, data, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`PUT request to ${endpoint} failed:`, error);
        throw error;
    }
}

const httpPatch = async <TData>(endpoint: string, data?: unknown, options?: ApiResponseOptions) : Promise<ApiResponse<TData>> => {
    try {
        const response = await axiosIntance().patch<ApiResponse<TData>>(endpoint, data, { 
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;

    } catch (error) {
        console.error(`PATCH request to ${endpoint} failed:`, error);
        throw error;
    }
}



const httpDelete = async <TData>(endpoint: string, options?: ApiResponseOptions) : Promise<ApiResponse<TData>>=> {
    try {
        const response = await axiosIntance().delete<ApiResponse<TData>>(endpoint, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`DELETE request to ${endpoint} failed:`, error);
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