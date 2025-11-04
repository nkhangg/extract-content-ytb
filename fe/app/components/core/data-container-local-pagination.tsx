"use client";

import langs from "./lang.json";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  MoreHorizontal,
  Search,
  X,
} from "lucide-react";
import type React from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { DateRange } from "react-day-picker";
import Loader from "../loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/utils/tailwind";

export interface DataContainerProps<T> {
  data: T[];
  lang?: keyof typeof langs;
  deb?: number;
  minLegSearch?: number;
  searchKeys?: (keyof T)[];
  filterOptions?: FilterOption[];
  sortOptions?: SortOption<T>[]; // New sorting options
  pageSize?: number;
  onPageSizeChange?: (newPageSize: number) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  renderLoading?: () => ReactNode;
  onSortChange?: (sortConfig: {
    key: keyof T | null;
    direction: "asc" | "desc";
  }) => void;
  onFilterChange?: (filters: {
    search: string;
    select: Record<string, string[]>;
    text: Record<string, string>;
    date: Record<string, Date | undefined>;
    dateRange: Record<string, { from?: Date; to?: Date }>;
    number: Record<string, number | undefined>;
    numberRange: Record<string, { min?: number; max?: number }>;
  }) => void;
  onPaginationChange?: (pagination: PaginationData) => void;
  pagination?: PaginationData;
  loading?: boolean;
  initialState?: InitialState<T>;
  customActions?: BulkAction<T>[];
  showPageSize?: boolean;
  pageSizeArr?: number[];
  nodata?: ReactNode;
  render: (paginationData: PaginationData & { items: T[] }) => ReactNode;
}

export function DataContainerLocalPagination<T extends Record<string, any>>({
  data,
  searchKeys = [],
  filterOptions = [],
  sortOptions = [], // New prop
  pageSize = 10,
  onPageSizeChange,
  onSelectionChange,
  onSortChange,
  onFilterChange,
  onPaginationChange,
  pagination,
  loading = false,
  initialState,
  customActions = [],
  showPageSize = true,
  lang = "en",
  pageSizeArr = [5, 10, 15, 20, 50, 100],
  deb = 300,
  minLegSearch = 0,
  renderLoading,
  nodata,
  render,
}: DataContainerProps<T>) {
  const [searchTerm, setSearchTerm] = useState(initialState?.search || "");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: "asc" | "desc";
  }>(initialState?.sort || { key: null, direction: "asc" });

  // Different filter states for different types
  const [filters, setFilters] = useState<Record<string, string[]>>(
    initialState?.filters?.select || {}
  );
  const [textFilters, setTextFilters] = useState<Record<string, string>>(
    initialState?.filters?.text || {}
  );
  const [dateFilters, setDateFilters] = useState<
    Record<string, Date | undefined>
  >(initialState?.filters?.date || {});
  const [dateRangeFilters, setDateRangeFilters] = useState<
    Record<string, { from?: Date; to?: Date }>
  >(initialState?.filters?.dateRange || {});
  const [numberFilters, setNumberFilters] = useState<
    Record<string, number | undefined>
  >(initialState?.filters?.number || {});
  const [numberRangeFilters, setNumberRangeFilters] = useState<
    Record<string, { min?: number; max?: number }>
  >(initialState?.filters?.numberRange || {});

  // Pending states for modal
  const [pendingFilters, setPendingFilters] = useState<
    Record<string, string[]>
  >(initialState?.filters?.select || {});
  const [pendingTextFilters, setPendingTextFilters] = useState<
    Record<string, string>
  >(initialState?.filters?.text || {});
  const [pendingDateFilters, setPendingDateFilters] = useState<
    Record<string, Date | undefined>
  >(initialState?.filters?.date || {});
  const [pendingDateRangeFilters, setPendingDateRangeFilters] = useState<
    Record<string, { from?: Date; to?: Date }>
  >(initialState?.filters?.dateRange || {});
  const [pendingNumberFilters, setPendingNumberFilters] = useState<
    Record<string, number | undefined>
  >(initialState?.filters?.number || {});
  const [pendingNumberRangeFilters, setPendingNumberRangeFilters] = useState<
    Record<string, { min?: number; max?: number }>
  >(initialState?.filters?.numberRange || {});
  const [pendingSearchTerm, setPendingSearchTerm] = useState(
    initialState?.search || ""
  );

  // Local search state
  const [localSearchTerm, setLocalSearchTerm] = useState(
    initialState?.search || ""
  );
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Other states
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [pendingBulkAction, setPendingBulkAction] =
    useState<BulkAction<T> | null>(null);
  const [internalCurrentPage, setInternalCurrentPage] = useState(
    initialState?.pagination?.currentPage || 1
  );
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [internalPageSize, setInternalPageSize] = useState(
    initialState?.pagination?.pageSize || pageSize
  );

  // Refs for preventing unnecessary callbacks
  const prevSortConfigRef = useRef<{
    key: keyof T | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });
  const prevFiltersRef = useRef<{
    search: string;
    select: Record<string, string[]>;
    text: Record<string, string>;
    date: Record<string, Date | undefined>;
    dateRange: Record<string, { from?: Date; to?: Date }>;
    number: Record<string, number | undefined>;
    numberRange: Record<string, { min?: number; max?: number }>;
  }>({
    search: "",
    select: {},
    text: {},
    date: {},
    dateRange: {},
    number: {},
    numberRange: {},
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    (term: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        setSearchTerm(term);
        // Reset to page 1 when searching
        if (pagination) {
          onPaginationChange?.({
            ...pagination,
            currentPage: 1,
          });
        } else {
          setInternalCurrentPage(1);
        }
      }, deb);
    },
    [pagination, onPaginationChange]
  );

  // Handle immediate search (Enter key)
  const handleImmediateSearch = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setSearchTerm(localSearchTerm);
    if (pagination) {
      onPaginationChange?.({
        ...pagination,
        currentPage: 1,
      });
    } else {
      setInternalCurrentPage(1);
    }
  }, [localSearchTerm, pagination, onPaginationChange]);

  // Handle search input change
  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearchTerm(value);

      if (value.length <= minLegSearch) return;

      setPendingSearchTerm(value.trim());

      debouncedSearch(value.trim());
    },
    [debouncedSearch]
  );

  // Handle Enter key press
  const handleSearchKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleImmediateSearch();
      }
    },
    [handleImmediateSearch]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Determine current pagination values
  const currentPage = pagination?.currentPage ?? internalCurrentPage;
  // const currentPageSize =
  //   pagination?.pageSize ?? initialState?.pagination?.pageSize ?? pageSize;
  const currentPageSize = pagination?.pageSize ?? internalPageSize ?? 10;

  const filteredData = useMemo(() => {
    if (pagination) {
      return data;
    }

    let filtered = data;

    // Apply search
    if (searchTerm && searchKeys.length > 0) {
      filtered = filtered.filter((item) =>
        searchKeys.some((key) =>
          String(item[key]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply select filters
    Object.entries(filters).forEach(([filterKey, filterValues]) => {
      if (filterValues.length > 0) {
        filtered = filtered.filter((item) =>
          filterValues.includes(String(item[filterKey]))
        );
      }
    });

    // Apply text filters
    Object.entries(textFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue.trim()) {
        filtered = filtered.filter((item) =>
          String(item[filterKey])
            .toLowerCase()
            .includes(filterValue.toLowerCase())
        );
      }
    });

    // Apply date filters
    Object.entries(dateFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter((item) => {
          const itemDate = new Date(item[filterKey]);
          return itemDate.toDateString() === filterValue.toDateString();
        });
      }
    });

    // Apply date range filters
    Object.entries(dateRangeFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue.from || filterValue.to) {
        filtered = filtered.filter((item) => {
          const itemDate = new Date(item[filterKey]);
          if (filterValue.from && itemDate < filterValue.from) return false;
          if (filterValue.to && itemDate > filterValue.to) return false;
          return true;
        });
      }
    });

    // Apply number filters
    Object.entries(numberFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue !== undefined) {
        filtered = filtered.filter(
          (item) => Number(item[filterKey]) === filterValue
        );
      }
    });

    // Apply number range filters
    Object.entries(numberRangeFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue.min !== undefined || filterValue.max !== undefined) {
        filtered = filtered.filter((item) => {
          const itemValue = Number(item[filterKey]);
          if (filterValue.min !== undefined && itemValue < filterValue.min)
            return false;
          if (filterValue.max !== undefined && itemValue > filterValue.max)
            return false;
          return true;
        });
      }
    });

    return filtered;
  }, [
    data,
    searchTerm,
    searchKeys,
    filters,
    textFilters,
    dateFilters,
    dateRangeFilters,
    numberFilters,
    numberRangeFilters,
    pagination,
  ]);

  const sortedData = useMemo(() => {
    if (pagination) {
      return filteredData;
    }

    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig, pagination]);

  const handleSort = (key: keyof T) => {
    const newSortConfig = {
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? ("desc" as const)
          : ("asc" as const),
    };
    setSortConfig(newSortConfig);
  };

  const handleClearSort = () => {
    setSortConfig({ key: null, direction: "asc" });
  };

  const handleFilterChange = (
    filterKey: string,
    value: string,
    checked: boolean
  ) => {
    setPendingFilters((prev) => {
      const currentValues = prev[filterKey] || [];
      if (checked) {
        return { ...prev, [filterKey]: [...currentValues, value] };
      } else {
        return {
          ...prev,
          [filterKey]: currentValues.filter((v) => v !== value),
        };
      }
    });
  };

  const handleTextFilterChange = (filterKey: string, value: string) => {
    setPendingTextFilters((prev) => ({ ...prev, [filterKey]: value }));
  };

  const handleDateFilterChange = (
    filterKey: string,
    date: Date | undefined
  ) => {
    setPendingDateFilters((prev) => ({ ...prev, [filterKey]: date }));
  };

  const handleDateRangeFilterChange = (
    filterKey: string,
    range: { from?: Date; to?: Date }
  ) => {
    setPendingDateRangeFilters((prev) => ({ ...prev, [filterKey]: range }));
  };

  const handleNumberFilterChange = (
    filterKey: string,
    value: number | undefined
  ) => {
    setPendingNumberFilters((prev) => ({ ...prev, [filterKey]: value }));
  };

  const handleNumberRangeFilterChange = (
    filterKey: string,
    range: { min?: number; max?: number }
  ) => {
    setPendingNumberRangeFilters((prev) => ({ ...prev, [filterKey]: range }));
  };

  const applyFilters = () => {
    setFilters(pendingFilters);
    setTextFilters(pendingTextFilters);
    setDateFilters(pendingDateFilters);
    setDateRangeFilters(pendingDateRangeFilters);
    setNumberFilters(pendingNumberFilters);
    setNumberRangeFilters(pendingNumberRangeFilters);
    setSearchTerm(pendingSearchTerm);

    // Reset to page 1 when applying filters
    if (pagination) {
      onPaginationChange?.({
        ...pagination,
        currentPage: 1,
      });
    } else {
      setInternalCurrentPage(1);
    }
  };

  const resetPendingFilters = () => {
    setPendingFilters(filters);
    setPendingTextFilters(textFilters);
    setPendingDateFilters(dateFilters);
    setPendingDateRangeFilters(dateRangeFilters);
    setPendingNumberFilters(numberFilters);
    setPendingNumberRangeFilters(numberRangeFilters);
    setPendingSearchTerm(searchTerm);
  };

  const clearAllFilters = () => {
    setFilters({});
    setTextFilters({});
    setDateFilters({});
    setDateRangeFilters({});
    setNumberFilters({});
    setNumberRangeFilters({});
    setSearchTerm("");
    setLocalSearchTerm("");

    // Also clear pending
    setPendingFilters({});
    setPendingTextFilters({});
    setPendingDateFilters({});
    setPendingDateRangeFilters({});
    setPendingNumberFilters({});
    setPendingNumberRangeFilters({});
    setPendingSearchTerm("");

    // Clear search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  const getActiveFiltersCount = () => {
    return (
      Object.keys(filters).reduce((acc, key) => acc + filters[key].length, 0) +
      Object.keys(textFilters).filter((key) => textFilters[key].trim()).length +
      Object.keys(dateFilters).filter((key) => dateFilters[key]).length +
      Object.keys(dateRangeFilters).filter(
        (key) => dateRangeFilters[key].from || dateRangeFilters[key].to
      ).length +
      Object.keys(numberFilters).filter(
        (key) => numberFilters[key] !== undefined
      ).length +
      Object.keys(numberRangeFilters).filter(
        (key) =>
          numberRangeFilters[key].min !== undefined ||
          numberRangeFilters[key].max !== undefined
      ).length
    );
  };

  const hasActiveFilters = () => {
    return (
      Object.keys(filters).some((key) => filters[key].length > 0) ||
      Object.keys(textFilters).some((key) => textFilters[key].trim()) ||
      Object.keys(dateFilters).some((key) => dateFilters[key]) ||
      Object.keys(dateRangeFilters).some(
        (key) => dateRangeFilters[key].from || dateRangeFilters[key].to
      ) ||
      Object.keys(numberFilters).some(
        (key) => numberFilters[key] !== undefined
      ) ||
      Object.keys(numberRangeFilters).some(
        (key) =>
          numberRangeFilters[key].min !== undefined ||
          numberRangeFilters[key].max !== undefined
      ) ||
      searchTerm.trim() ||
      localSearchTerm.trim()
    );
  };

  const hasPendingChanges = () => {
    return (
      JSON.stringify(pendingFilters) !== JSON.stringify(filters) ||
      JSON.stringify(pendingTextFilters) !== JSON.stringify(textFilters) ||
      JSON.stringify(pendingDateFilters) !== JSON.stringify(dateFilters) ||
      JSON.stringify(pendingDateRangeFilters) !==
        JSON.stringify(dateRangeFilters) ||
      JSON.stringify(pendingNumberFilters) !== JSON.stringify(numberFilters) ||
      JSON.stringify(pendingNumberRangeFilters) !==
        JSON.stringify(numberRangeFilters) ||
      pendingSearchTerm !== searchTerm
    );
  };

  const handleRowSelection = (row: T, checked: boolean) => {
    const newSelection = checked
      ? [...selectedRows, row]
      : selectedRows.filter((r) => r !== row);
    setSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? paginatedData.items : [];
    setSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleBulkAction = (action: BulkAction<T>) => {
    if (action.confirmMessage) {
      setPendingBulkAction(action);
      setShowBulkConfirm(true);
    } else {
      action.action(selectedRows);
    }
  };

  const confirmBulkAction = () => {
    if (pendingBulkAction) {
      pendingBulkAction.action(selectedRows);
      setPendingBulkAction(null);
    }
    setShowBulkConfirm(false);
  };

  const cancelBulkAction = () => {
    setPendingBulkAction(null);
    setShowBulkConfirm(false);
  };

  function paginate(array: typeof data, page = 1, pageSize = 10) {
    const totalItems = array.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const items = array.slice(startIndex, endIndex);

    return {
      page,
      pageSize,
      totalItems,
      totalPages,
      items,
      startIndex,
      endIndex,
    };
  }

  const paginatedData = useMemo(() => {
    return paginate(data, currentPage, currentPageSize);
  }, [currentPage, currentPageSize, data]);

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    onPaginationChange?.({
      currentPage: newPage,
      totalPages: paginatedData.totalPages,
      pageSize: currentPageSize,
      totalItems: paginatedData.totalItems,
      endIndex: paginatedData.endIndex,
      startIndex: paginatedData.startIndex,
    });

    setInternalCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (pagination && onPaginationChange) {
      onPaginationChange({
        ...pagination,
        pageSize: newPageSize,
        currentPage: 1, // Reset to first page when changing page size
      });
    } else {
      setInternalPageSize(newPageSize);
      setInternalCurrentPage(1);
      onPageSizeChange?.(newPageSize);

      onPaginationChange?.({
        currentPage: currentPage,
        totalPages: paginatedData.totalPages,
        pageSize: newPageSize,
        totalItems: paginatedData.totalItems,
        endIndex: paginatedData.endIndex,
        startIndex: paginatedData.startIndex,
      });
    }
  };

  const renderFilter = (filterOption: FilterOption) => {
    switch (filterOption.type) {
      case "select":
        return (
          <DropdownMenu key={filterOption.key}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-dashed bg-transparent"
              >
                <Filter className="mr-2 h-4 w-4" />
                {filterOption.label}
                {pendingFilters[filterOption.key]?.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {pendingFilters[filterOption.key].length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-full">
              <DropdownMenuLabel>{filterOption.label}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filterOption.options?.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={
                    pendingFilters[filterOption.key]?.includes(option.value) ||
                    false
                  }
                  onCheckedChange={(checked) =>
                    handleFilterChange(filterOption.key, option.value, checked)
                  }
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );

      case "text":
        return (
          <div key={filterOption.key} className="relative">
            <Input
              placeholder={
                filterOption.placeholder ||
                `${
                  langs[lang].prev_filter
                } ${filterOption.label.toLowerCase()}...`
              }
              value={pendingTextFilters[filterOption.key] || ""}
              onChange={(e) =>
                handleTextFilterChange(filterOption.key, e.target.value)
              }
              className="w-full"
            />
            {pendingTextFilters[filterOption.key] && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-6 w-6 p-0"
                onClick={() => handleTextFilterChange(filterOption.key, "")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        );

      case "date":
        return (
          <Popover key={filterOption.key}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="border-dashed bg-transparent w-[220px] justify-start text-left"
              >
                <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate flex-1">
                  {pendingDateFilters[filterOption.key]
                    ? format(
                        pendingDateFilters[filterOption.key]!,
                        "dd/MM/yyyy",
                        { locale: vi }
                      )
                    : filterOption.label}
                </span>
                {pendingDateFilters[filterOption.key] && (
                  <Badge variant="secondary" className="ml-2 flex-shrink-0">
                    1
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={pendingDateFilters[filterOption.key]}
                onSelect={(date) =>
                  handleDateFilterChange(filterOption.key, date)
                }
                initialFocus
              />
              {pendingDateFilters[filterOption.key] && (
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDateFilterChange(filterOption.key, undefined)
                    }
                    className="w-full"
                  >
                    {langs[lang].clear_filter}
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        );

      case "dateRange":
        const dateRange = pendingDateRangeFilters[filterOption.key] || {};
        return (
          <Popover key={filterOption.key}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="border-dashed bg-transparent w-[280px] justify-start text-left"
              >
                <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate flex-1">
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                        {format(dateRange.to, "dd/MM/yyyy", { locale: vi })}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy", { locale: vi })
                    )
                  ) : (
                    filterOption.label
                  )}
                </span>
                {(pendingDateRangeFilters[filterOption.key]?.from ||
                  pendingDateRangeFilters[filterOption.key]?.to) && (
                  <Badge variant="secondary" className="ml-2 flex-shrink-0">
                    1
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange as DateRange}
                onSelect={(range) =>
                  handleDateRangeFilterChange(filterOption.key, range || {})
                }
                numberOfMonths={2}
                initialFocus
              />
              {(dateRange.from || dateRange.to) && (
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDateRangeFilterChange(filterOption.key, {})
                    }
                    className="w-full"
                  >
                    {langs[lang].clear_filter}
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        );

      case "number":
        return (
          <div key={filterOption.key} className="relative">
            <Input
              type="number"
              placeholder={
                filterOption.placeholder ||
                `Lọc ${filterOption.label.toLowerCase()}...`
              }
              value={pendingNumberFilters[filterOption.key] || ""}
              onChange={(e) =>
                handleNumberFilterChange(
                  filterOption.key,
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              min={filterOption.min}
              max={filterOption.max}
              className="w-full"
            />
            {pendingNumberFilters[filterOption.key] !== undefined && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-6 w-6 p-0"
                onClick={() =>
                  handleNumberFilterChange(filterOption.key, undefined)
                }
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        );

      case "numberRange":
        const numberRange = pendingNumberRangeFilters[filterOption.key] || {};
        return (
          <Popover key={filterOption.key}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="border-dashed bg-transparent w-full justify-start"
              >
                <Filter className="mr-2 h-4 w-4" />
                {numberRange.min !== undefined || numberRange.max !== undefined
                  ? `${numberRange.min || "∞"} - ${numberRange.max || "∞"}`
                  : filterOption.label}
                {(pendingNumberRangeFilters[filterOption.key]?.min !==
                  undefined ||
                  pendingNumberRangeFilters[filterOption.key]?.max !==
                    undefined) && (
                  <Badge variant="secondary" className="ml-2">
                    1
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px]" align="start">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">
                    {" "}
                    {langs[lang].from}
                  </label>
                  <Input
                    type="number"
                    placeholder={langs[lang].min_value}
                    value={numberRange.min || ""}
                    onChange={(e) =>
                      handleNumberRangeFilterChange(filterOption.key, {
                        ...numberRange,
                        min: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    min={filterOption.min}
                    max={filterOption.max}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {" "}
                    {langs[lang].to}
                  </label>
                  <Input
                    type="number"
                    placeholder={langs[lang].max_value}
                    value={numberRange.max || ""}
                    onChange={(e) =>
                      handleNumberRangeFilterChange(filterOption.key, {
                        ...numberRange,
                        max: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    min={filterOption.min}
                    max={filterOption.max}
                  />
                </div>
                {(numberRange.min !== undefined ||
                  numberRange.max !== undefined) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleNumberRangeFilterChange(filterOption.key, {})
                    }
                    className="w-full"
                  >
                    {langs[lang].clear_filter}
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        );

      default:
        return null;
    }
  };

  // Effect hooks for callbacks
  useEffect(() => {
    const currentSortConfig = sortConfig;
    if (
      JSON.stringify(currentSortConfig) !==
        JSON.stringify(prevSortConfigRef.current) &&
      onSortChange
    ) {
      prevSortConfigRef.current = currentSortConfig;
      onSortChange(currentSortConfig);
    }
  }, [sortConfig, onSortChange]);

  useEffect(() => {
    const currentFilters = {
      search: searchTerm,
      select: filters,
      text: textFilters,
      date: dateFilters,
      dateRange: dateRangeFilters,
      number: numberFilters,
      numberRange: numberRangeFilters,
    };

    if (
      JSON.stringify(currentFilters) !==
        JSON.stringify(prevFiltersRef.current) &&
      onFilterChange
    ) {
      prevFiltersRef.current = currentFilters;
      onFilterChange(currentFilters);
    }
  }, [
    searchTerm,
    filters,
    textFilters,
    dateFilters,
    dateRangeFilters,
    numberFilters,
    numberRangeFilters,
    onFilterChange,
  ]);

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {searchKeys.length > 0 && (
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Tooltip
                open={
                  localSearchTerm.length <= minLegSearch &&
                  localSearchTerm.length >= 1
                }
              >
                <TooltipContent>
                  {langs[lang].min_leg_search.replaceAll(
                    "$$",
                    String(minLegSearch)
                  )}
                </TooltipContent>
                <TooltipTrigger asChild>
                  <Input
                    placeholder={langs[lang].search}
                    value={localSearchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className="pl-8 pr-8"
                    disabled={loading}
                  />
                </TooltipTrigger>
              </Tooltip>
              {localSearchTerm && localSearchTerm !== searchTerm && (
                <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
              {localSearchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => {
                    setLocalSearchTerm("");
                    setSearchTerm("");
                    setPendingSearchTerm("");
                    if (searchTimeoutRef.current) {
                      clearTimeout(searchTimeoutRef.current);
                    }
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Sort Dropdown - New Addition */}
            {sortOptions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-dashed bg-transparent"
                    disabled={loading}
                  >
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    {langs[lang].sort}
                    {sortConfig.key && (
                      <Badge variant="secondary" className="ml-2">
                        1
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                  <DropdownMenuLabel>{langs[lang].sort_by}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {sortOptions.map((option) => (
                    <DropdownMenuItem
                      key={String(option.key)}
                      onClick={() => handleSort(option.key)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        {sortConfig.key === option.key && (
                          <div className="flex items-center">
                            {sortConfig.direction === "asc" ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )}
                          </div>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                  {sortConfig.key && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleClearSort}
                        className="cursor-pointer text-muted-foreground"
                      >
                        <X className="mr-2 h-4 w-4" />
                        {langs[lang].clear_sort}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {filterOptions.length > 0 && (
              <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-dashed bg-transparent"
                    disabled={loading}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    {langs[lang].filter}
                    {hasActiveFilters() && (
                      <Badge variant="secondary" className="ml-2">
                        {getActiveFiltersCount()}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="md:max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{langs[lang].advanced_filters}</DialogTitle>
                    <DialogDescription>
                      {langs[lang].customize_filter_criteria}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Quick Filters (Select types) */}
                      {filterOptions.filter((f) => f.type === "select").length >
                        0 && (
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide block">
                            {langs[lang].quick_filters}
                          </label>
                          <div className="space-y-3">
                            {filterOptions
                              .filter((f) => f.type === "select")
                              .map(renderFilter)}
                          </div>
                        </div>
                      )}

                      {/* Text Filters */}
                      {filterOptions.filter((f) => f.type === "text").length >
                        0 && (
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide block">
                            {langs[lang].search_by_field}
                          </label>
                          <div className="space-y-3">
                            {filterOptions
                              .filter((f) => f.type === "text")
                              .map(renderFilter)}
                          </div>
                        </div>
                      )}

                      {/* Date Filters */}
                      {filterOptions.filter(
                        (f) => f.type === "date" || f.type === "dateRange"
                      ).length > 0 && (
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide block">
                            {langs[lang].filter_by_time}
                          </label>
                          <div className="space-y-3">
                            {filterOptions
                              .filter(
                                (f) =>
                                  f.type === "date" || f.type === "dateRange"
                              )
                              .map(renderFilter)}
                          </div>
                        </div>
                      )}

                      {/* Number Filters */}
                      {filterOptions.filter(
                        (f) => f.type === "number" || f.type === "numberRange"
                      ).length > 0 && (
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide block">
                            {langs[lang].filter_by_number}
                          </label>
                          <div className="space-y-3">
                            {filterOptions
                              .filter(
                                (f) =>
                                  f.type === "number" ||
                                  f.type === "numberRange"
                              )
                              .map(renderFilter)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Filter Summary */}
                    <div className="mt-6 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-muted-foreground">
                            {getActiveFiltersCount()}{" "}
                            {langs[lang].filter_applying}
                          </div>
                          {hasPendingChanges() && (
                            <Badge variant="outline" className="text-xs">
                              {langs[lang].unsaved_changes}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          onClick={resetPendingFilters}
                          size="sm"
                          disabled={loading}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reset
                        </Button>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        clearAllFilters();
                        setShowFilterModal(false);
                      }}
                      disabled={loading}
                    >
                      {langs[lang].clear_all_filters}
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          resetPendingFilters();
                          setShowFilterModal(false);
                        }}
                        disabled={loading}
                      >
                        {langs[lang].cancel}
                      </Button>
                      <Button
                        onClick={() => {
                          applyFilters();
                          setShowFilterModal(false);
                        }}
                        disabled={!hasPendingChanges() || loading}
                      >
                        <Filter className="mr-2 h-4 w-4" />
                        {langs[lang].apply_filters}
                      </Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Custom Actions Menu */}
            {customActions && customActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size={"icon"}
                    className="bg-transparent"
                    disabled={loading}
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[220px]">
                  {customActions.map((action) => (
                    <DropdownMenuItem
                      key={action.key}
                      disabled={action.disable}
                      onClick={() => handleBulkAction(action)}
                      className={`cursor-pointer ${
                        action.variant === "destructive"
                          ? "text-destructive focus:text-destructive"
                          : ""
                      }`}
                    >
                      {action.icon && (
                        <span className="mr-2">{action.icon}</span>
                      )}
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {sortConfig.key && (
              <Button
                variant="outline"
                onClick={handleClearSort}
                size="sm"
                disabled={loading}
              >
                <X className="mr-2 h-4 w-4" />
                {langs[lang].clear_sort}
              </Button>
            )}

            {hasActiveFilters() && (
              <Button
                variant="outline"
                onClick={clearAllFilters}
                size="sm"
                disabled={loading}
              >
                <X className="mr-2 h-4 w-4" />
                {langs[lang].clear_all_filters}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Container */}
      {loading ? (
        renderLoading ? (
          renderLoading()
        ) : (
          <div className="w-full min-h-28 flex items-center justify-center">
            <Loader size="size-6" />
          </div>
        )
      ) : data.length > 0 ? (
        render({ currentPage: currentPage, ...paginatedData })
      ) : nodata ? (
        nodata
      ) : (
        <div className="w-full min-h-24 flex items-center justify-center text-center">
          {langs[lang].no_data_found}
        </div>
      )}

      {/* Pagination */}
      <div
        className={cn("flex items-center", {
          ["justify-between"]: showPageSize,
          ["justify-end"]: !showPageSize,
        })}
      >
        {showPageSize && (
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">{langs[lang].show}</p>
            <Select
              value={String(currentPageSize)}
              onValueChange={(value) => handlePageSizeChange(Number(value))}
              disabled={loading}
            >
              <SelectTrigger className="h-8 min-w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeArr.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm font-medium">
              {langs[lang].top} {paginatedData.totalItems} {langs[lang].result}
            </p>
          </div>
        )}

        {paginatedData.totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">
              {langs[lang].page} {currentPage} / {paginatedData.totalPages}
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0 bg-transparent"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1 || loading}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0 bg-transparent"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0 bg-transparent"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === paginatedData.totalPages || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0 bg-transparent"
                onClick={() => handlePageChange(paginatedData.totalPages)}
                disabled={currentPage === paginatedData.totalPages || loading}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Confirmation Dialog */}
      {showBulkConfirm && pendingBulkAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">
              {langs[lang].confirm_title}
            </h3>
            <p className="text-gray-600 mb-4">
              {pendingBulkAction.confirmMessage}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {langs[lang].confirm_des.replaceAll(
                "$$",
                String(selectedRows.length)
              )}
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={cancelBulkAction}
                disabled={loading}
              >
                {langs[lang].cancel}
              </Button>
              <Button
                variant={
                  pendingBulkAction.variant === "destructive"
                    ? "destructive"
                    : "default"
                }
                onClick={confirmBulkAction}
                disabled={loading}
              >
                {langs[lang].confirm}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
