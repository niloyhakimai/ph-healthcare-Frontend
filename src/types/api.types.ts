export interface ApiResponse<TData = unknown> {
    success: boolean;
    message: string;
    data: TData;
    meta?: PaginationMeta;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total : number;
    totalPage?: number;
    totalPages?: number;
}

export interface ApiErrorSource {
    path: string;
    message: string;
}

export interface ApiErrorResponse {
    success: false;
    message: string;
    errorSources?: ApiErrorSource[];
}
