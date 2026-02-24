import axios from 'axios';
import { tr } from 'date-fns/locale';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if(!API_BASE_URL) {
    throw new Error('API base URL is not defined in environment variables');
}


const axiosIntance = () => {
    const instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 3000, // 3 seconds timeout
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

const httpGet = async (endpoint: string, options?: ApiResponseOptions) => {

    try {
        const response = await axiosIntance().get(endpoint, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`GET request to ${endpoint} failed:`, error);
        throw error;
    }
}

const httpPost = async (endpoint: string, data?: unknown, options?: ApiResponseOptions) => {
    try {
        const response = await axiosIntance().post(endpoint, data, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`POST request to ${endpoint} failed:`, error);
        throw error;
    }
}


const httpPut = async (endpoint: string, data?: unknown, options?: ApiResponseOptions) => {
    try {
        const response = await axiosIntance().put(endpoint, data, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`PUT request to ${endpoint} failed:`, error);
        throw error;
    }
}

const httpPatch = async (endpoint: string, data?: unknown, options?: ApiResponseOptions) => {
    try {
        const response = await axiosIntance().patch(endpoint, data, { 
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`PATCH request to ${endpoint} failed:`, error);
        throw error;
    }
}



const httpDelete = async (endpoint: string, options?: ApiResponseOptions) => {
    try {
        const response = await axiosIntance().delete(endpoint, {
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