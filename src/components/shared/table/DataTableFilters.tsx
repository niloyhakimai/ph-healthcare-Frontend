'use client'

import React, { useEffect, useMemo, useState } from "react";
import { ColumnFilter, Table } from "@tanstack/react-table";
import { Check, ChevronDown, Filter, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface DataTableFilterOption {
    label: string;
    value: string;
}

export interface DataTableRangeValue {
    min?: string;
    max?: string;
}

interface DataTableBaseFilterConfig {
    id: string;
    label: string;
    description?: string;
    debounceMs?: number;
}

export interface DataTableMultiSelectFilterConfig extends DataTableBaseFilterConfig {
    type: "multi-select";
    options: DataTableFilterOption[];
    emptyMessage?: string;
}

export interface DataTableSingleSelectFilterConfig extends DataTableBaseFilterConfig {
    type: "single-select";
    options: DataTableFilterOption[];
    placeholder?: string;
}

export interface DataTableRangeFilterConfig extends DataTableBaseFilterConfig {
    type: "range";
    minPlaceholder?: string;
    maxPlaceholder?: string;
}

export type DataTableFilterConfig =
    | DataTableMultiSelectFilterConfig
    | DataTableSingleSelectFilterConfig
    | DataTableRangeFilterConfig;

type FilterDraftValue = string | string[] | DataTableRangeValue;

interface DataTableFiltersProps<TData> {
    table: Table<TData>;
    configs: DataTableFilterConfig[];
}

const getFilterValue = (
    filters: ColumnFilter[],
    filterId: string,
) => filters.find((filter) => filter.id === filterId)?.value;

const setFilterValue = <TData,>(
    table: Table<TData>,
    filterId: string,
    nextValue: unknown,
) => {
    const nextFilters = table
        .getState()
        .columnFilters
        .filter((filter) => filter.id !== filterId);

    if (typeof nextValue === "undefined") {
        table.setColumnFilters(nextFilters);
        return;
    }

    table.setColumnFilters([
        ...nextFilters,
        {
            id: filterId,
            value: nextValue,
        },
    ]);
};

const normalizeFilterValue = (
    config: DataTableFilterConfig,
    value: unknown,
): FilterDraftValue => {
    if (config.type === "multi-select") {
        return Array.isArray(value) ? value.map(String) : [];
    }

    if (config.type === "single-select") {
        return typeof value === "string" ? value : "";
    }

    if (value && typeof value === "object") {
        const rangeValue = value as DataTableRangeValue;

        return {
            min: typeof rangeValue.min === "string" ? rangeValue.min : "",
            max: typeof rangeValue.max === "string" ? rangeValue.max : "",
        };
    }

    return { min: "", max: "" };
};

const resolveFilterValueForTable = (
    config: DataTableFilterConfig,
    value: FilterDraftValue,
) => {
    if (config.type === "multi-select") {
        return Array.isArray(value) && value.length > 0 ? value : undefined;
    }

    if (config.type === "single-select") {
        return typeof value === "string" && value ? value : undefined;
    }

    const rangeValue = value as DataTableRangeValue;
    const min = rangeValue.min?.trim() ?? "";
    const max = rangeValue.max?.trim() ?? "";

    if (!min && !max) {
        return undefined;
    }

    return { min, max };
};

const filterValuesAreEqual = (left: FilterDraftValue, right: FilterDraftValue) =>
    JSON.stringify(left) === JSON.stringify(right);

const isFilterActive = (config: DataTableFilterConfig, value: FilterDraftValue) => {
    if (config.type === "multi-select") {
        return Array.isArray(value) && value.length > 0;
    }

    if (config.type === "single-select") {
        return typeof value === "string" && value.length > 0;
    }

    const rangeValue = value as DataTableRangeValue;
    return Boolean(rangeValue.min?.trim() || rangeValue.max?.trim());
};

const buildFilterButtonLabel = (
    config: DataTableFilterConfig,
    value: FilterDraftValue,
) => {
    if (config.type === "multi-select") {
        const selectedValues = value as string[];

        return selectedValues.length > 0
            ? `${config.label} (${selectedValues.length})`
            : config.label;
    }

    if (config.type === "single-select") {
        const selectedValue = value as string;
        const selectedOption = config.options.find((option) => option.value === selectedValue);

        return selectedOption ? `${config.label}: ${selectedOption.label}` : config.label;
    }

    const rangeValue = value as DataTableRangeValue;
    const min = rangeValue.min?.trim() ?? "";
    const max = rangeValue.max?.trim() ?? "";

    if (min && max) {
        return `${config.label}: ${min}-${max}`;
    }

    if (min) {
        return `${config.label}: >= ${min}`;
    }

    if (max) {
        return `${config.label}: <= ${max}`;
    }

    return config.label;
};

const DataTableFilterPopover = <TData,>({
    table,
    config,
}: {
    table: Table<TData>;
    config: DataTableFilterConfig;
}) => {
    const columnFilters = table.getState().columnFilters;
    const appliedValue = useMemo(
        () => normalizeFilterValue(config, getFilterValue(columnFilters, config.id)),
        [columnFilters, config],
    );
    const [draftValue, setDraftValue] = useState<FilterDraftValue>(appliedValue);

    useEffect(() => {
        setDraftValue(appliedValue);
    }, [appliedValue]);

    useEffect(() => {
        if (config.type !== "range" || !config.debounceMs || filterValuesAreEqual(draftValue, appliedValue)) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setFilterValue(
                table,
                config.id,
                resolveFilterValueForTable(config, draftValue),
            );
        }, config.debounceMs);

        return () => window.clearTimeout(timeoutId);
    }, [appliedValue, config, draftValue, table]);

    const applyDraftValue = () => {
        setFilterValue(
            table,
            config.id,
            resolveFilterValueForTable(config, draftValue),
        );
    };

    const clearDraftValue = () => {
        const clearedValue = normalizeFilterValue(config, undefined);

        setDraftValue(clearedValue);
        setFilterValue(table, config.id, undefined);
    };

    return (
        <Popover>
            <div className="flex items-center gap-1">
                <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className="justify-between gap-2">
                        <span className="truncate">{buildFilterButtonLabel(config, appliedValue)}</span>
                        <ChevronDown className="h-4 w-4 opacity-60" />
                    </Button>
                </PopoverTrigger>

                {isFilterActive(config, appliedValue) && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={clearDraftValue}
                    >
                        <X />
                        <span className="sr-only">Clear {config.label}</span>
                    </Button>
                )}
            </div>

            <PopoverContent align="start" className="w-80">
                <PopoverHeader className="mb-4">
                    <PopoverTitle>{config.label}</PopoverTitle>
                    {config.description && (
                        <PopoverDescription>{config.description}</PopoverDescription>
                    )}
                </PopoverHeader>

                {config.type === "multi-select" && (
                    <div className="space-y-4">
                        <ScrollArea className="h-56 pr-3">
                            <div className="space-y-3">
                                {config.options.length > 0 ? (
                                    config.options.map((option) => {
                                        const selectedValues = draftValue as string[];
                                        const isChecked = selectedValues.includes(option.value);

                                        return (
                                            <div
                                                key={option.value}
                                                className="flex cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
                                            >
                                                <span>{option.label}</span>
                                                <Checkbox
                                                    checked={isChecked}
                                                    onCheckedChange={(checked) => {
                                                        setDraftValue((currentValue) => {
                                                            const currentSelections = currentValue as string[];
                                                            const isNextChecked = checked === true;

                                                            if (isNextChecked) {
                                                                if (currentSelections.includes(option.value)) {
                                                                    return currentSelections;
                                                                }

                                                                return [...currentSelections, option.value];
                                                            }

                                                            return currentSelections.filter(
                                                                (value) => value !== option.value,
                                                            );
                                                        });
                                                    }}
                                                />
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        {config.emptyMessage ?? "No options found."}
                                    </p>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                )}

                {config.type === "single-select" && (
                    <Select
                        value={(draftValue as string) || "__all__"}
                        onValueChange={(value) => {
                            setDraftValue(value === "__all__" ? "" : value);
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={config.placeholder ?? "Select"} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All</SelectItem>
                            {config.options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {config.type === "range" && (
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            type="number"
                            min={0}
                            inputMode="numeric"
                            value={(draftValue as DataTableRangeValue).min ?? ""}
                            onChange={(event) =>
                                setDraftValue((currentValue) => ({
                                    ...(currentValue as DataTableRangeValue),
                                    min: event.target.value,
                                }))
                            }
                            placeholder={config.minPlaceholder ?? "Minimum"}
                        />
                        <Input
                            type="number"
                            min={0}
                            inputMode="numeric"
                            value={(draftValue as DataTableRangeValue).max ?? ""}
                            onChange={(event) =>
                                setDraftValue((currentValue) => ({
                                    ...(currentValue as DataTableRangeValue),
                                    max: event.target.value,
                                }))
                            }
                            placeholder={config.maxPlaceholder ?? "Maximum"}
                        />
                    </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                    <Button type="button" variant="ghost" size="sm" onClick={clearDraftValue}>
                        Clear
                    </Button>
                    <Button type="button" size="sm" onClick={applyDraftValue}>
                        <Check className="h-4 w-4" />
                        Apply changes
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

const DataTableFilters = <TData,>({
    table,
    configs,
}: DataTableFiltersProps<TData>) => {
    if (configs.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Filter className="h-4 w-4" />
                Filters
            </div>

            {configs.map((config) => (
                <DataTableFilterPopover key={config.id} table={table} config={config} />
            ))}
        </div>
    );
};

export default DataTableFilters;
