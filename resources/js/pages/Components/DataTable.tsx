'use client';

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
    ColumnFiltersState,
    SortingState,
    getSortedRowModel,
} from '@tanstack/react-table';
import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    title?: string;
    description?: string;
    searchKey?: string;
    filterOptions?: {
        [key: string]: string[];
    };
}

export function DataTable<TData, TValue>({
    columns,
    data,
    title,
    description,
    searchKey,
    filterOptions = {},
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<{
        column: string;
        value: string;
    }>({ column: '', value: '' });

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    // Handle filter selection
    const handleFilterChange = (column: string, value: string) => {
        setSelectedFilter({ column, value });

        if (value === 'all') {
            // Remove filter for this column
            table.getColumn(column)?.setFilterValue(undefined);
        } else {
            // Apply filter
            table.getColumn(column)?.setFilterValue(value);
        }
    };

    // Handle global search
    const handleSearch = (value: string) => {
        setGlobalFilter(value);
    };

    // Clear all filters
    const clearFilters = () => {
        setColumnFilters([]);
        setGlobalFilter('');
        setSelectedFilter({ column: '', value: '' });
        table.resetColumnFilters();
        table.resetGlobalFilter();
    };

    return (
        <div className="space-y-4">
            {/* Header with title and description */}
            {(title || description) && (
                <div className="mb-4">
                    {title && <h1 className="text-2xl font-bold mb-2">{title}</h1>}
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
            )}

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                {/* Global Search */}
                {searchKey && (
                    <div className="relative w-full sm:w-auto sm:flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder={`Search by ${searchKey.toLowerCase()}...`}
                            value={globalFilter ?? ''}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10 w-full"
                        />
                    </div>
                )}

                {/* Dynamic Filters */}
                {Object.keys(filterOptions).length > 0 && (
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        {Object.entries(filterOptions).map(([column, options]) => (
                            <Select
                                key={column}
                                value={selectedFilter.column === column ? selectedFilter.value : 'all'}
                                onValueChange={(value) => handleFilterChange(column, value)}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder={`Filter ${column}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All {column}</SelectItem>
                                    {options.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ))}
                    </div>
                )}

                {/* Clear Filters Button */}
                {(globalFilter || columnFilters.length > 0) && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="whitespace-nowrap"
                    >
                        Clear Filters
                    </Button>
                )}
            </div>

            {/* Table */}
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {table.getRowModel().rows.length} of{' '}
                    {data.length} results
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
