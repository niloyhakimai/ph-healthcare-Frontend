'use client'

import React, { useEffect, useState } from "react";
import { Table } from "@tanstack/react-table";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DataTableSearchProps<TData> {
    table: Table<TData>;
    placeholder?: string;
    debounceMs?: number;
}

const DataTableSearch = <TData,>({
    table,
    placeholder = "Search...",
    debounceMs = 400,
}: DataTableSearchProps<TData>) => {
    const globalFilterValue = String(table.getState().globalFilter ?? "");
    const [searchValue, setSearchValue] = useState(globalFilterValue);

    useEffect(() => {
        setSearchValue(globalFilterValue);
    }, [globalFilterValue]);

    useEffect(() => {
        if (searchValue === globalFilterValue) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            table.setGlobalFilter(searchValue);
        }, debounceMs);

        return () => window.clearTimeout(timeoutId);
    }, [debounceMs, globalFilterValue, searchValue, table]);

    const handleClear = () => {
        setSearchValue("");
        table.setGlobalFilter("");
    };

    return (
        <div className="relative w-full sm:max-w-sm">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

            <Input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="pl-9 pr-10"
                placeholder={placeholder}
            />

            {searchValue && (
                <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    className="absolute top-1/2 right-1 -translate-y-1/2"
                    onClick={handleClear}
                >
                    <X />
                    <span className="sr-only">Clear search</span>
                </Button>
            )}
        </div>
    );
};

export default DataTableSearch;
