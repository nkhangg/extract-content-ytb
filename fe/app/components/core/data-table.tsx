"use client";

import langs from "./lang.json";
import type React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  Star,
  StarHalf,
  Trash2,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { DateRange } from "react-day-picker";
import { ConfirmAlert } from "../btn/confirm-alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/utils/tailwind";

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  displayType?:
    | "text"
    | "password"
    | "image"
    | "avatar"
    | "badge"
    | "currency"
    | "date"
    | "datetime"
    | "boolean"
    | "progress"
    | "link"
    | "email"
    | "phone"
    | "tags"
    | "status"
    | "rating"
    | "filesize"
    | "percentage"
    | "custom";
  displayOptions?: {
    // For badge
    badgeVariant?: "default" | "secondary" | "destructive" | "outline";
    badgeColorMap?: Record<string, string>;

    // For currency
    currency?: string;
    locale?: string;

    // For date
    dateFormat?: string;

    // For boolean
    trueLabel?: string;
    falseLabel?: string;

    // For progress
    showPercentage?: boolean;
    colorThreshold?: { value: number; color: string }[];

    // For link
    openInNewTab?: boolean;

    // For avatar
    fallbackText?: (row: T) => string;

    // For status
    statusMap?: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
        color?: string;
      }
    >;

    // For rating
    maxRating?: number;
    showHalfStars?: boolean;

    // For tags
    maxTags?: number;
    tagVariant?: "default" | "secondary" | "destructive" | "outline";
  };
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

// Thêm interface cho custom actions
interface CustomAction<T> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  action: (row: T) => void;
  show?: (row: T) => boolean; // Điều kiện hiển thị action,
  render?: (row: T, content: ReactNode) => ReactNode;
}

export interface InitialState<T> {
  pagination?: {
    currentPage?: number;
    pageSize?: number;
  };
  search?: string;
  sort?: {
    key: keyof T;
    direction: "asc" | "desc";
  };
  filters?: {
    select?: Record<string, string[]>;
    text?: Record<string, string>;
    date?: Record<string, Date>;
    dateRange?: Record<string, { from?: Date; to?: Date }>;
    number?: Record<string, number>;
    numberRange?: Record<string, { min?: number; max?: number }>;
  };
}

export interface TableState<T> {
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    startIndex: number;
    endIndex: number;
  };
  search: string;
  sort: {
    key: keyof T | null;
    direction: "asc" | "desc";
  };
  filters: {
    select: Record<string, string[]>;
    text: Record<string, string>;
    date: Record<string, Date | undefined>;
    dateRange: Record<string, { from?: Date; to?: Date }>;
    number: Record<string, number | undefined>;
    numberRange: Record<string, { min?: number; max?: number }>;
    not?: Record<string, string>;
  };
  data: {
    filtered: T[];
    sorted: T[];
    paginated: T[];
  };
  selection: T[];
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  nodata?: ReactNode;
  notfound?: ReactNode;
  searchKeys?: (keyof T)[];
  filterOptions?: FilterOption[];
  pageSize?: number;
  minLegSearch?: number;
  deb?: number;
  lang?: keyof typeof langs;
  onPageSizeChange?: (newPageSize: number) => void;
  onRowClick?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  isDeselectAll?: boolean;
  // Thêm các callback mới
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
  onDataChange?: (data: {
    filtered: T[];
    sorted: T[];
    paginated: T[];
    totalPages: number;
    currentPage: number;
  }) => void;
  bulkActions?: BulkAction<T>[];
  customActions?: CustomAction<T>[]; // Thêm prop cho custom actions
  onPaginationChange?: (pagination: PaginationData) => void;
  // Thêm pagination props để control từ bên ngoài
  pagination?: PaginationData;
  loading?: boolean;
  initialState?: InitialState<T>;
  onStateChange?: (state: TableState<T>) => void;
  options?: {
    disableDel?: boolean | ((data: T) => boolean);
  };
  styles?: Record<string, string>;
  showPageSize?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKeys = [],
  filterOptions = [],
  pageSize = 10,
  onPageSizeChange,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  selectable = false,
  onSelectionChange,
  isDeselectAll = false,
  onSortChange,
  onFilterChange,
  onDataChange,
  bulkActions = [],
  customActions = [], // Thêm prop mới
  onPaginationChange,
  pagination,
  loading = false,
  initialState, // Add this line
  onStateChange,
  options,
  lang = "en",
  deb = 300,
  minLegSearch = 0,
  styles,
  nodata,
  notfound,
  showPageSize = true,
}: DataTableProps<T>) {
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

  // Thêm sau các state hiện tại
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

  // Thêm state cho search độc lập
  const [localSearchTerm, setLocalSearchTerm] = useState(
    initialState?.search || ""
  );
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      }, deb); // 300ms delay
    },
    [pagination, onPaginationChange]
  );

  // Handle immediate search (Enter key)
  const handleImmediateSearch = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setSearchTerm(localSearchTerm);
    // Reset to page 1 when searching
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

      setPendingSearchTerm(value); // Sync with pending for modal

      debouncedSearch(value.trim());

      // Auto search with debounce
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

  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [pendingBulkAction, setPendingBulkAction] =
    useState<BulkAction<T> | null>(null);

  // Sử dụng internal pagination state nếu không có pagination props
  const [internalCurrentPage, setInternalCurrentPage] = useState(
    initialState?.pagination?.currentPage || 1
  );
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(
    new Set()
  );

  // Use refs to track previous values and prevent unnecessary callback calls
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
  const prevDataRef = useRef<{
    filtered: T[];
    sorted: T[];
    paginated: T[];
    totalPages: number;
    currentPage: number;
  }>({
    filtered: [],
    sorted: [],
    paginated: [],
    totalPages: 0,
    currentPage: 1,
  });
  const prevPaginationRef = useRef<PaginationData>({
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0,
    startIndex: 0,
    endIndex: 0,
  });

  const prevTableStateRef = useRef<TableState<T> | null>(null);

  // Determine current pagination values
  const currentPage = pagination?.currentPage ?? internalCurrentPage;
  const currentPageSize =
    pagination?.pageSize ?? initialState?.pagination?.pageSize ?? pageSize;
  const totalPages =
    pagination?.totalPages ?? Math.ceil(data.length / currentPageSize);
  const totalItems = pagination?.totalItems ?? data.length;

  const filteredData = useMemo(() => {
    // Nếu có pagination props, nghĩa là data đã được filter/sort từ server
    if (pagination) {
      return data;
    }

    // Nếu không có pagination props, thực hiện client-side filtering
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
          if (filterValue.max !== undefined && itemValue < filterValue.max)
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
    // Nếu có pagination props, data đã được sort từ server
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

  const paginatedData = useMemo(() => {
    // Nếu có pagination props, data đã được paginate từ server
    if (pagination) {
      return sortedData;
    }

    // Client-side pagination
    const startIndex = (currentPage - 1) * currentPageSize;
    return sortedData.slice(startIndex, startIndex + currentPageSize);
  }, [sortedData, currentPage, currentPageSize, pagination]);

  const handleSort = (key: keyof T) => {
    const newSortConfig = {
      key,
      direction: (sortConfig.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc") as "asc" | "desc",
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
    setTextFilters(textFilters);
    setDateFilters(dateFilters);
    setDateRangeFilters(dateRangeFilters);
    setNumberFilters(numberFilters);
    setNumberRangeFilters(numberRangeFilters);
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
    setLocalSearchTerm(""); // Thêm dòng này
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
      localSearchTerm.trim() // Thêm localSearchTerm
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
    const newSelection = checked ? paginatedData : [];
    setSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleDeselectAll = () => {
    setSelectedRows([]);
    onSelectionChange?.([]);
  };

  useEffect(() => {
    if (isDeselectAll) {
      handleDeselectAll();
    }
  }, [isDeselectAll]);

  const handleBulkAction = (action: BulkAction<T>) => {
    if (action.confirmMessage) {
      setPendingBulkAction(action);
      setShowBulkConfirm(true);
    } else {
      action.action(selectedRows, { clearSelected: handleDeselectAll });
    }
  };

  const confirmBulkAction = () => {
    if (pendingBulkAction) {
      pendingBulkAction.action(selectedRows, {
        clearSelected: handleDeselectAll,
      });
      setPendingBulkAction(null);
    }
    setShowBulkConfirm(false);
  };

  const cancelBulkAction = () => {
    setPendingBulkAction(null);
    setShowBulkConfirm(false);
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (pagination && onPaginationChange) {
      onPaginationChange({
        ...pagination,
        currentPage: newPage,
      });
    } else {
      setInternalCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (pagination && onPaginationChange) {
      onPaginationChange({
        ...pagination,
        pageSize: newPageSize,
        currentPage: 1, // Reset to first page when changing page size
      });
    } else {
      setInternalCurrentPage(1);
      onPageSizeChange?.(newPageSize);
    }
  };

  const getSortIcon = (key: keyof T) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
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
                `${langs[lang].filter} ${filterOption.label.toLowerCase()}...`
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
                `${
                  langs[lang].prev_filter
                } ${filterOption.label.toLowerCase()}...`
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

  const renderDisplayType = (
    column: Column<T>,
    value: any,
    row: T,
    index: number
  ) => {
    const { displayType, displayOptions = {} } = column;

    switch (displayType) {
      case "password":
        const passwordKey = `${String(column.key)}-${row.id || Math.random()}`;
        const isVisible = visiblePasswords.has(passwordKey);
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">
              {isVisible ? value : "••••••••"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setVisiblePasswords((prev) => {
                  const newSet = new Set(prev);
                  if (isVisible) {
                    newSet.delete(passwordKey);
                  } else {
                    newSet.add(passwordKey);
                  }
                  return newSet;
                });
              }}
            >
              {isVisible ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </Button>
          </div>
        );

      case "image":
        return (
          <img
            src={value || "/placeholder.svg?height=40&width=40"}
            alt="Image"
            className="h-10 w-10 rounded object-cover"
          />
        );

      case "avatar":
        const fallback = displayOptions.fallbackText
          ? displayOptions.fallbackText(row)
          : String(value).charAt(0).toUpperCase();
        return (
          <Avatar className="h-8 w-8">
            <AvatarImage src={value || "/placeholder.svg"} alt="Avatar" />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
        );

      case "badge":
        const badgeVariant = displayOptions.badgeVariant || "default";
        const colorMap = displayOptions.badgeColorMap || {};
        const badgeColor = colorMap[String(value)];
        return (
          <Badge
            variant={badgeVariant}
            className={
              badgeColor
                ? `bg-${badgeColor}-100 text-${badgeColor}-800 border-${badgeColor}-200`
                : ""
            }
          >
            {value}
          </Badge>
        );

      case "currency":
        const currency = displayOptions.currency || "VND";
        const locale = displayOptions.locale || "vi-VN";
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency: currency,
        }).format(Number(value));

      case "date":
        const dateFormat = displayOptions.dateFormat || "dd/MM/yyyy";
        return format(new Date(value), dateFormat, { locale: vi });

      case "datetime":
        return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi });

      case "boolean":
        const trueLabel = displayOptions.trueLabel || "Có";
        const falseLabel = displayOptions.falseLabel || "Không";
        const boolValue = Boolean(value);
        return (
          <Badge variant={boolValue ? "default" : "secondary"}>
            {boolValue ? trueLabel : falseLabel}
          </Badge>
        );

      case "progress":
        const percentage = Math.min(100, Math.max(0, Number(value)));
        const showPercentage = displayOptions.showPercentage !== false;
        const thresholds = displayOptions.colorThreshold || [];

        let progressColor = "bg-primary";
        for (const threshold of thresholds) {
          if (percentage >= threshold.value) {
            progressColor = threshold.color;
          }
        }

        return (
          <div className="flex items-center gap-2 min-w-[100px]">
            <Progress value={percentage} className="flex-1" />
            {showPercentage && (
              <span className="text-sm text-muted-foreground">
                {percentage}%
              </span>
            )}
          </div>
        );

      case "link":
        const openInNewTab = displayOptions.openInNewTab !== false;
        return (
          <a
            href={value}
            target={openInNewTab ? "_blank" : "_self"}
            rel={openInNewTab ? "noopener noreferrer" : ""}
            className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {value}
            {openInNewTab && <ExternalLink className="h-3 w-3" />}
          </a>
        );

      case "email":
        return (
          <a
            href={`mailto:${value}`}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Mail className="h-3 w-3" />
            {value}
          </a>
        );

      case "phone":
        return (
          <a
            href={`tel:${value}`}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="h-3 w-3" />
            {value}
          </a>
        );

      case "tags":
        const tags = Array.isArray(value)
          ? value
          : String(value)
              .split(",")
              .map((s) => s.trim());
        const maxTags = displayOptions.maxTags || 3;
        const tagVariant = displayOptions.tagVariant || "secondary";
        const visibleTags = tags.slice(0, maxTags);
        const remainingCount = tags.length - maxTags;

        return (
          <div className="flex flex-wrap gap-1">
            {visibleTags.map((tag, index) => (
              <Badge key={index} variant={tagVariant} className="text-xs">
                {tag}
              </Badge>
            ))}
            {remainingCount > 0 && (
              <Badge variant="outline" className="text-xs">
                +{remainingCount}
              </Badge>
            )}
          </div>
        );

      case "status":
        const statusMap = displayOptions.statusMap || {};
        const statusConfig = statusMap[String(value)] || {
          label: String(value),
          variant: "default" as const,
        };
        return (
          <Badge
            variant={statusConfig.variant}
            className={statusConfig.color ? statusConfig.color : ""}
          >
            {statusConfig.label}
          </Badge>
        );

      case "rating":
        const rating = Number(value);
        const maxRating = displayOptions.maxRating || 5;
        const showHalfStars = displayOptions.showHalfStars !== false;

        return (
          <div className="flex items-center gap-1">
            <div className="flex">
              {Array.from({ length: maxRating }, (_, i) => {
                const starValue = i + 1;
                if (rating >= starValue) {
                  return (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  );
                } else if (showHalfStars && rating >= starValue - 0.5) {
                  return (
                    <StarHalf
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  );
                } else {
                  return <Star key={i} className="h-4 w-4 text-gray-300" />;
                }
              })}
            </div>
            <span className="text-sm text-muted-foreground">({rating})</span>
          </div>
        );

      case "filesize":
        const bytes = Number(value);
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        if (bytes === 0) return "0 Bytes";
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (
          Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
        );

      case "percentage":
        return `${Number(value).toFixed(1)}%`;

      case "custom":
        return column.render ? column.render(value, row, index) : String(value);

      default:
        return String(value);
    }
  };

  // Function để render action menu
  const renderActionMenu = (row: T) => {
    // Kiểm tra xem có action nào để hiển thị không
    const hasDefaultActions = onView || onEdit || onDelete;
    const visibleCustomActions = customActions.filter(
      (action) => !action.show || action.show(row)
    );
    const hasActions = hasDefaultActions || visibleCustomActions.length > 0;

    if (!hasActions) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="w-full flex items-center justify-center">
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
              disabled={loading}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Default actions */}
          {onView && (
            <DropdownMenuItem
              onClick={() => onView(row)}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              {langs[lang].show}
            </DropdownMenuItem>
          )}
          {onEdit && (
            <DropdownMenuItem
              onClick={() => onEdit(row)}
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              {langs[lang].edit}
            </DropdownMenuItem>
          )}

          {/* Custom actions */}
          {visibleCustomActions.map((action) => {
            const content = (
              <div className="flex items-center gap-2 cursor-pointer">
                {action.icon && (
                  <span className="mr-2 h-4 w-4">{action.icon}</span>
                )}
                {action.label}
              </div>
            );

            return (
              <DropdownMenuItem
                key={action.key}
                onClick={() => action.action(row)}
                onSelect={
                  action?.render
                    ? (e) => {
                        e.preventDefault(); // Ngăn dropdown đóng lại
                        e.stopPropagation();
                      }
                    : undefined
                }
                className={`cursor-pointer ${
                  action.variant === "destructive"
                    ? "text-destructive focus:text-destructive"
                    : ""
                }`}
              >
                {action?.render ? action.render(row, content) : content}
              </DropdownMenuItem>
            );
          })}

          {/* Separator before delete if there are other actions */}
          {onDelete &&
            (hasDefaultActions || visibleCustomActions.length > 0) && (
              <DropdownMenuSeparator />
            )}

          {/* Delete action (always last) */}
          {onDelete && (
            <DropdownMenuItem
              disabled={
                typeof options?.disableDel === "function"
                  ? options.disableDel(row) // Gọi hàm với `row` là dữ liệu hiện tại
                  : options?.disableDel ?? false
              }
              onSelect={(e) => {
                e.preventDefault(); // Ngăn dropdown đóng lại
                e.stopPropagation();
              }}
            >
              <ConfirmAlert onConfirm={() => onDelete(row)}>
                <div className="flex items-center gap-2 cursor-pointer text-destructive hover:!text-destructive">
                  <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                  {langs[lang].delete}
                </div>
              </ConfirmAlert>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Only call callbacks when values actually change
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

  useEffect(() => {
    const currentData = {
      filtered: filteredData,
      sorted: sortedData,
      paginated: paginatedData,
      totalPages,
      currentPage,
    };

    if (
      JSON.stringify(currentData) !== JSON.stringify(prevDataRef.current) &&
      onDataChange
    ) {
      prevDataRef.current = currentData;
      onDataChange(currentData);
    }
  }, [
    filteredData,
    sortedData,
    paginatedData,
    totalPages,
    currentPage,
    onDataChange,
  ]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * currentPageSize + 1;
    const endIndex = Math.min(currentPage * currentPageSize, totalItems);

    const currentPagination = {
      currentPage,
      pageSize: currentPageSize,
      totalPages,
      totalItems,
      startIndex,
      endIndex,
    };

    if (
      JSON.stringify(currentPagination) !==
        JSON.stringify(prevPaginationRef.current) &&
      onPaginationChange &&
      !pagination
    ) {
      prevPaginationRef.current = currentPagination;
      onPaginationChange(currentPagination);
    }
  }, [
    currentPage,
    currentPageSize,
    totalPages,
    totalItems,
    onPaginationChange,
    pagination,
  ]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * currentPageSize + 1;
    const endIndex = Math.min(currentPage * currentPageSize, totalItems);

    const currentTableState: TableState<T> = {
      pagination: {
        currentPage,
        pageSize: currentPageSize,
        totalPages,
        totalItems,
        startIndex,
        endIndex,
      },
      search: searchTerm,
      sort: sortConfig,
      filters: {
        select: filters,
        text: textFilters,
        date: dateFilters,
        dateRange: dateRangeFilters,
        number: numberFilters,
        numberRange: numberRangeFilters,
      },
      data: {
        filtered: filteredData,
        sorted: sortedData,
        paginated: paginatedData,
      },
      selection: selectedRows,
    };

    if (
      JSON.stringify(currentTableState) !==
        JSON.stringify(prevTableStateRef.current) &&
      onStateChange
    ) {
      prevTableStateRef.current = currentTableState;
      onStateChange(currentTableState);
    }
  }, [
    currentPage,
    currentPageSize,
    totalPages,
    totalItems,
    searchTerm,
    sortConfig,
    filters,
    textFilters,
    dateFilters,
    dateRangeFilters,
    numberFilters,
    numberRangeFilters,
    filteredData,
    sortedData,
    paginatedData,
    selectedRows,
    onStateChange,
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
                <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle> {langs[lang].advanced_filters}</DialogTitle>
                    <DialogDescription>
                      {langs[lang].customize_filter_criteria}
                    </DialogDescription>
                  </DialogHeader>

                  {/* Filter content */}
                  <div className="py-4">
                    {/* Organized Filter Groups - Responsive Grid */}
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

            {/* Bulk Actions Menu - Moved here */}
            {selectedRows.length > 0 && bulkActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-dashed bg-transparent"
                    disabled={loading}
                  >
                    <MoreHorizontal className="mr-2 h-4 w-4" />
                    {langs[lang].actions} ({selectedRows.length})
                    <Badge variant="secondary" className="ml-2">
                      {selectedRows.length}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[220px]">
                  <DropdownMenuLabel>
                    {langs[lang].bulk_actions}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {bulkActions.map((action) => (
                    <DropdownMenuItem
                      key={action.key}
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDeselectAll}
                    className="cursor-pointer text-muted-foreground"
                  >
                    <X className="mr-2 h-4 w-4" />
                    {langs[lang].deselect_all}
                  </DropdownMenuItem>
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

      {/* Table */}
      {nodata ? (
        nodata
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead
                    className={cn(
                      "w-12",
                      styles?.["table.header.select"] || ""
                    )}
                  >
                    <Checkbox
                      checked={
                        paginatedData.length > 0 &&
                        paginatedData.every((row) => selectedRows.includes(row))
                      }
                      onCheckedChange={handleSelectAll}
                      disabled={loading}
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead key={String(column.key)}>
                    {column.sortable ? (
                      <Button
                        variant="ghost"
                        onClick={() => handleSort(column.key)}
                        className="h-auto p-0 !-mx-3 font-semibold"
                        disabled={loading}
                      >
                        {column.label}
                        {getSortIcon(column.key)}
                      </Button>
                    ) : (
                      column.label
                    )}
                  </TableHead>
                ))}
                {(onEdit || onDelete || onView || customActions.length > 0) && (
                  <TableHead className="w-12 sticky right-0 bg-background border-l shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] z-10">
                    {langs[lang].actions}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length +
                      (selectable ? 1 : 0) +
                      (onEdit || onDelete || onView || customActions.length > 0
                        ? 1
                        : 0)
                    }
                    className="h-24 text-center"
                  >
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2">{langs[lang].loading}...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length +
                      (selectable ? 1 : 0) +
                      (onEdit || onDelete || onView || customActions.length > 0
                        ? 1
                        : 0)
                    }
                    className="min-h-24 text-center"
                  >
                    {notfound ? notfound : langs[lang].no_data_found}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, index) => (
                  <TableRow
                    key={index}
                    className={
                      onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
                    }
                    onClick={() => !loading && onRowClick?.(row)}
                  >
                    {selectable && (
                      <TableCell className="text-center">
                        <Checkbox
                          checked={selectedRows.includes(row)}
                          onCheckedChange={(checked: boolean) =>
                            handleRowSelection(row, checked)
                          }
                          onClick={(e) => e.stopPropagation()}
                          disabled={loading}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={String(column.key)}>
                        {renderDisplayType(column, row[column.key], row, index)}
                      </TableCell>
                    ))}
                    {(onEdit ||
                      onDelete ||
                      onView ||
                      customActions.length > 0) && (
                      <TableCell className="sticky right-0 bg-background border-l shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] z-10">
                        {renderActionMenu(row)}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
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
                {[5, 10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm font-medium">
              {langs[lang].top} {totalItems} {langs[lang].result}
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">
              {langs[lang].page} {currentPage} / {totalPages}
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
                disabled={currentPage === totalPages || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0 bg-transparent"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages || loading}
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
              {langs[lang].confirm}
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
