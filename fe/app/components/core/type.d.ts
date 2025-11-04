interface FilterOption {
  key: string;
  label: string;
  type: "select" | "text" | "date" | "dateRange" | "number" | "numberRange";
  options?: { value: string; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
}

interface BulkAction<T> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disable?: boolean;
  variant?: "default" | "secondary" | "destructive" | "outline";
  action: (selectedRows: T[], options?: { clearSelected: () => void }) => void;
  confirmMessage?: string;
}

interface PaginationData {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
}

interface InitialState<T> {
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

interface TableState<T> {
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
  };
  data: {
    filtered: T[];
    sorted: T[];
    paginated: T[];
  };
  selection: T[];
}

interface SortOption<T> {
  key: keyof T;
  label: string;
}
