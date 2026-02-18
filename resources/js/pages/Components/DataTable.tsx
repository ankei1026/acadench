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
import { Search, Filter, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    title?: string;
    description?: string;
    searchKey?: string;
    filterOptions?: {
        [key: string]: string[];
    };
    onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    title,
    description,
    searchKey,
    filterOptions = {},
    onRowClick,
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

    const handleFilterChange = (column: string, value: string) => {
        setSelectedFilter({ column, value });

        if (value === 'all') {
            table.getColumn(column)?.setFilterValue(undefined);
        } else {
            table.getColumn(column)?.setFilterValue(value);
        }
    };

    const handleSearch = (value: string) => {
        setGlobalFilter(value);
    };

    const clearFilters = () => {
        setColumnFilters([]);
        setGlobalFilter('');
        setSelectedFilter({ column: '', value: '' });
        table.resetColumnFilters();
        table.resetGlobalFilter();
    };

    const hasActiveFilters = globalFilter || columnFilters.length > 0;

    return (
        <div className="space-y-6">
            {/* Header with title and description */}
            {(title || description) && (
                <div className="mb-2">
                    {title && (
                        <h2 className="text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                            {title}
                        </h2>
                    )}
                    {description && (
                        <p className="text-sm text-gray-600 mt-1">{description}</p>
                    )}
                </div>
            )}

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                {/* Global Search */}
                {searchKey && (
                    <div className="relative w-full sm:w-auto sm:flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 h-4 w-4" />
                        <Input
                            placeholder={`Search by ${searchKey.toLowerCase()}...`}
                            value={globalFilter ?? ''}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10 w-full border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 focus:ring-2 transition-all duration-200"
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
                                <SelectTrigger className="w-full sm:w-[180px] border-gray-200 focus:ring-amber-500/20 focus:ring-2 focus:border-amber-500 transition-all duration-200">
                                    <Filter className="mr-2 h-4 w-4 text-amber-500" />
                                    <SelectValue placeholder={`Filter by ${column}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-gray-500 focus:bg-amber-50 focus:text-amber-900">
                                        All {column}
                                    </SelectItem>
                                    {options.map((option) => (
                                        <SelectItem
                                            key={option}
                                            value={option}
                                            className="focus:bg-amber-50 focus:text-amber-900 capitalize"
                                        >
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ))}
                    </div>
                )}

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="whitespace-nowrap border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 transition-all duration-200"
                    >
                        <XCircle className="mr-2 h-4 w-4" />
                        Clear Filters
                    </Button>
                )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500">Active filters:</span>
                    {globalFilter && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Search: {globalFilter}
                            <button
                                onClick={() => setGlobalFilter('')}
                                className="ml-2 hover:text-amber-900"
                            >
                                ×
                            </button>
                        </Badge>
                    )}
                    {columnFilters.map((filter) => (
                        <Badge key={filter.id} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 capitalize">
                            {filter.id}: {filter.value as string}
                            <button
                                onClick={() => table.getColumn(filter.id)?.setFilterValue(undefined)}
                                className="ml-2 hover:text-amber-900"
                            >
                                ×
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* Table */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 border-b border-gray-200 hover:bg-transparent"
                            >
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className="text-gray-700 font-semibold py-4"
                                        >
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
                            table.getRowModel().rows.map((row, index) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className={
                                        `hover:bg-amber-50/50 transition-all duration-150 ` +
                                        `${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} ` +
                                        `${onRowClick ? 'cursor-pointer' : ''}`
                                    }
                                    onClick={() => onRowClick?.(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-4">
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
                                    className="h-40 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                        <div className="rounded-full bg-gradient-to-r from-amber-100 to-orange-100 p-4 mb-4">
                                            <Search className="h-6 w-6 text-amber-500" />
                                        </div>
                                        <p className="font-medium text-gray-700">No applications found</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {hasActiveFilters
                                                ? 'Try adjusting your search or filters'
                                                : 'No tutor applications have been submitted yet'}
                                        </p>
                                        {hasActiveFilters && (
                                            <Button
                                                variant="link"
                                                onClick={clearFilters}
                                                className="mt-2 text-amber-600 hover:text-amber-700 font-medium"
                                            >
                                                Clear all filters
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-2">
                <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-amber-700">{table.getRowModel().rows.length}</span> of{' '}
                    <span className="font-semibold text-amber-700">{data.length}</span> results
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="border-gray-200 text-gray-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-700 transition-all duration-200"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                    </Button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: table.getPageCount() }, (_, i) => i + 1)
                            .slice(
                                Math.max(0, table.getState().pagination.pageIndex - 2),
                                Math.min(table.getPageCount(), table.getState().pagination.pageIndex + 3)
                            )
                            .map((page) => (
                                <Button
                                    key={page}
                                    variant={table.getState().pagination.pageIndex + 1 === page ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => table.setPageIndex(page - 1)}
                                    className={table.getState().pagination.pageIndex + 1 === page
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                                        : 'border-gray-200 text-gray-700 hover:bg-amber-50 hover:text-amber-700'
                                    }
                                >
                                    {page}
                                </Button>
                            ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="border-gray-200 text-gray-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-700 transition-all duration-200"
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
