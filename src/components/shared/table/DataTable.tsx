'use client'

import DataTableFilters, { DataTableFilterConfig } from "@/components/shared/table/DataTableFilters";
import DataTablePagination from "@/components/shared/table/DataTablePagination";
import DataTableSearch from "@/components/shared/table/DataTableSearch";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from "lucide-react";

interface DataTableActions<TData> {
    onView ?: (data : TData) => void;
    onEdit ?: (data : TData) => void;
    onDelete ?: (data : TData) => void;
}

interface DataTableProps<TData> {
    data : TData[];
    columns : ColumnDef<TData>[];
    actions ?: DataTableActions<TData>;
    emptyMessage ?: string;
    isLoading ?: boolean;
    sorting ?: {
        state : SortingState;
        onSortingChange : (state : SortingState) => void;
    }
    pagination ?: {
        state : PaginationState;
        onPaginationChange : (state : PaginationState) => void;
        pageCount : number;
        totalRows : number;
        limitOptions ?: readonly number[];
    }
    search ?: {
        value : string;
        onSearchChange : (value : string) => void;
        placeholder ?: string;
        debounceMs ?: number;
    }
    filters ?: {
        state : ColumnFiltersState;
        onFiltersChange : (state : ColumnFiltersState) => void;
        configs : DataTableFilterConfig[];
    }
}

const DataTable = <TData,>({data, columns, actions, emptyMessage, isLoading, sorting, pagination, search, filters} : DataTableProps<TData>) => {
    
    const tableColumns : ColumnDef<TData>[] = actions ? [...columns, {

        id : "actions",
        header : "Actions",
        enableSorting : false,
        cell: ({ row }) => {
            const rowData = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={"ghost"} className="h-8 w-8 p-0">
                            <span className="sr-only">Open Menu</span>
                            <MoreHorizontal className="h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>

                     <DropdownMenuContent align="end">
                        {
                            actions.onView && (
                                <DropdownMenuItem onClick={() => actions.onView?.(rowData)}>
                                    View
                                </DropdownMenuItem>
                            )
                        }

                        {
                            actions.onEdit && (
                                <DropdownMenuItem onClick={() => actions.onEdit?.(rowData)}>
                                    Edit
                                </DropdownMenuItem>
                            )
                        }

                        {
                            actions.onDelete && (
                                <DropdownMenuItem onClick={() => actions.onDelete?.(rowData)}>
                                    Delete
                                </DropdownMenuItem>
                            )
                        }
                     </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }] : columns;
    const table = useReactTable({
        data,
        columns: tableColumns,
        getCoreRowModel : getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualSorting: !!sorting,
        manualPagination: !!pagination,
        manualFiltering: !!search || !!filters,
        pageCount: pagination?.pageCount,
        rowCount: pagination?.totalRows,
        state: {
            ...(sorting ? { sorting : sorting.state } : {}),
            ...(pagination ? { pagination : pagination.state } : {}),
            ...(search ? { globalFilter : search.value } : {}),
            ...(filters ? { columnFilters : filters.state } : {}),
        },

        onSortingChange : sorting ? 
            (updater) => {
                const currentSortingState = sorting.state;
                const nextSortingState = typeof updater === "function" ? updater(currentSortingState) : updater;
                
                sorting.onSortingChange(nextSortingState);
            
            }
            : undefined,
        onPaginationChange : pagination ?
            (updater) => {
                const currentPaginationState = pagination.state;
                const nextPaginationState = typeof updater === "function" ? updater(currentPaginationState) : updater;

                pagination.onPaginationChange(nextPaginationState);
            }
            : undefined,
        onGlobalFilterChange : search ?
            (updater) => {
                const currentGlobalFilter = search.value;
                const nextGlobalFilter = typeof updater === "function" ? updater(currentGlobalFilter) : updater;

                search.onSearchChange(String(nextGlobalFilter ?? ""));
            }
            : undefined,
        onColumnFiltersChange : filters ?
            (updater) => {
                const currentFiltersState = filters.state;
                const nextFiltersState = typeof updater === "function" ? updater(currentFiltersState) : updater;

                filters.onFiltersChange(nextFiltersState);
            }
            : undefined
    })

    const {getHeaderGroups, getRowModel} = table;
    return (
   <div className="relative">
    {
        isLoading && (
             <div className="doctor-loader-container">
                <div className="heartbeat"></div>
                <p className="loading-text">Loading Medical Services...</p>
            </div>
        )
    }

    {/* Table */}
     <div className="rounded-lg border">
            {
                (search || filters) && (
                    <div className="flex flex-col gap-3 border-b px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                        {search ? (
                            <DataTableSearch
                                table={table}
                                placeholder={search.placeholder}
                                debounceMs={search.debounceMs}
                            />
                        ) : <div />}

                        {filters && (
                            <DataTableFilters
                                table={table}
                                configs={filters.configs}
                            />
                        )}
                    </div>
                )
            }

            <Table>
            <TableHeader>
                {getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id}>
                        {hg.headers.map((header) => (
                        <TableHead key={header.id}>
                            {
                                header.isPlaceholder ? null : header.column.getCanSort() ? ( <Button variant={"ghost"}
                                className="h-auto cursor-pointer p-0 font-semibold hover:bg-transparent hover:text-inherit focus-visible:ring-0"
                                onClick={header.column.getToggleSortingHandler()}
                                >
                                    {
                                        flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                    {
                                     header.column.getIsSorted() === "asc" ? (
                                        <ArrowUp className="ml-1 h-4 w-4" />
                                     ) : header.column.getIsSorted() === "desc" ? (
                                        <ArrowDown className="ml-1 h-4 w-4" />
                                     )  : <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
                                    }

                                </Button>) : ( flexRender(header.column.columnDef.header, header.getContext())
                            

                        )}
                        </TableHead>
                        ))}
                    </TableRow>
                    ))}
            </TableHeader>
            <TableBody>
                {
                    getRowModel().rows.length ? (
                        getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                    ))}
                </TableRow>
                ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                                {emptyMessage || "No data available."}
                            </TableCell>
                        </TableRow>
                    )
                
                }
            </TableBody>
        </Table>

        {
            pagination && (
                <DataTablePagination
                    table={table}
                    totalRows={pagination.totalRows}
                    currentRowCount={data.length}
                    limitOptions={pagination.limitOptions}
                />
            )
        }
    </div>
   </div>
  )
}

export default DataTable
