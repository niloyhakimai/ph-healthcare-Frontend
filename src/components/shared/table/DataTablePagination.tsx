'use client'

import React, { useEffect, useMemo, useState } from "react";
import { Table } from "@tanstack/react-table";
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
    table: Table<TData>;
    totalRows: number;
    currentRowCount: number;
    limitOptions?: readonly number[];
}

const getVisiblePages = (currentPage: number, totalPages: number) => {
    if (totalPages <= 0) {
        return [];
    }

    const visiblePages = new Set<number>([1, totalPages, currentPage]);

    for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
        if (page > 1 && page < totalPages) {
            visiblePages.add(page);
        }
    }

    const sortedPages = Array.from(visiblePages).sort((left, right) => left - right);
    const pageItems: Array<number | "ellipsis"> = [];

    sortedPages.forEach((page, index) => {
        if (index > 0 && page - sortedPages[index - 1] > 1) {
            pageItems.push("ellipsis");
        }

        pageItems.push(page);
    });

    return pageItems;
};

const DataTablePagination = <TData,>({
    table,
    totalRows,
    currentRowCount,
    limitOptions = [1, 10, 20, 50, 100],
}: DataTablePaginationProps<TData>) => {
    const { pageIndex, pageSize } = table.getState().pagination;
    const [customLimit, setCustomLimit] = useState(String(pageSize));

    useEffect(() => {
        setCustomLimit(String(pageSize));
    }, [pageSize]);

    const rawPageCount = table.getPageCount();
    const pageCount = totalRows > 0 ? Math.max(rawPageCount, 1) : 0;
    const currentPage = totalRows === 0 ? 0 : pageIndex + 1;
    const rowStart = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
    const rowEnd = totalRows === 0 ? 0 : Math.min(rowStart + currentRowCount - 1, totalRows);

    const canPreviousPage = currentPage > 1;
    const canNextPage = pageCount > 0 && currentPage < pageCount;

    const resolvedLimitOptions = useMemo(() => {
        const uniqueOptions = new Set([...limitOptions, pageSize]);

        return Array.from(uniqueOptions).sort((left, right) => left - right);
    }, [limitOptions, pageSize]);

    const visiblePages = useMemo(
        () => getVisiblePages(currentPage, pageCount),
        [currentPage, pageCount],
    );

    const applyPageSize = (nextPageSize: number) => {
        if (!Number.isInteger(nextPageSize) || nextPageSize < 1) {
            return;
        }

        table.setPagination({
            pageIndex: 0,
            pageSize: nextPageSize,
        });
    };

    const handleCustomLimitApply = () => {
        const parsedLimit = Number.parseInt(customLimit, 10);

        if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
            return;
        }

        applyPageSize(parsedLimit);
    };

    return (
        <div className="flex flex-col gap-4 border-t px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                <div className="text-sm text-muted-foreground">
                    Showing {rowStart}-{rowEnd} of {totalRows} records
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Rows per page</span>
                    <Select
                        value={String(pageSize)}
                        onValueChange={(value) => applyPageSize(Number(value))}
                    >
                        <SelectTrigger size="sm" className="min-w-20">
                            <SelectValue placeholder="Limit" />
                        </SelectTrigger>
                        <SelectContent>
                            {resolvedLimitOptions.map((option) => (
                                <SelectItem key={option} value={String(option)}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input
                        type="number"
                        min={1}
                        inputMode="numeric"
                        value={customLimit}
                        onChange={(event) => setCustomLimit(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                handleCustomLimitApply();
                            }
                        }}
                        className="w-24"
                        placeholder="Custom"
                    />

                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleCustomLimitApply}
                    >
                        Apply
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
                <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {pageCount}
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!canPreviousPage}
                    >
                        <ChevronsLeft />
                    </Button>
                    <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        onClick={() => table.previousPage()}
                        disabled={!canPreviousPage}
                    >
                        <ChevronLeft />
                    </Button>

                    {visiblePages.map((page, index) =>
                        page === "ellipsis" ? (
                            <span key={`ellipsis-${index}`} className="px-2 text-sm text-muted-foreground">
                                ...
                            </span>
                        ) : (
                            <Button
                                key={page}
                                type="button"
                                size="sm"
                                variant={page === currentPage ? "default" : "outline"}
                                onClick={() => table.setPageIndex(page - 1)}
                                disabled={page === currentPage}
                            >
                                {page}
                            </Button>
                        ),
                    )}

                    <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        onClick={() => table.nextPage()}
                        disabled={!canNextPage}
                    >
                        <ChevronRight />
                    </Button>
                    <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        onClick={() => table.setPageIndex(Math.max(pageCount - 1, 0))}
                        disabled={!canNextPage}
                    >
                        <ChevronsRight />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DataTablePagination;
