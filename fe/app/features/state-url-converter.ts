import type { DeepPartial } from "react-hook-form";
import type { TableState } from "@/components/core/data-table";

/**
 * Chuyển đổi TableState thành URL query parameters
 * @param state - TableState object từ onStateChange callback
 * @returns URLSearchParams object
 */
export function stateToURLQuery<T>(
  state: TableState<T>,
  defaultLimit = 10
): URLSearchParams {
  const params = new URLSearchParams();

  // 📄 Pagination
  if (state.pagination.currentPage > 1) {
    params.set("page", state.pagination.currentPage.toString());
  }
  if (state.pagination.pageSize !== defaultLimit) {
    // Default page size
    params.set("size", state.pagination.pageSize.toString());
  }

  // 🔍 Search
  if (state.search && state.search.trim()) {
    params.set("search", state.search.trim());
  }

  // 🔄 Sort
  if (state.sort.key) {
    params.set("sort", String(state.sort.key));
    if (state.sort.direction !== "asc") {
      // Default direction
      params.set("dir", state.sort.direction);
    }
  }

  // 🎯 Select Filters
  Object.entries(state.filters.select).forEach(([key, values]) => {
    if (values && values.length > 0) {
      params.set(`filter_${key}`, values.join(","));
    }
  });

  // 📝 Text Filters
  Object.entries(state.filters.text).forEach(([key, value]) => {
    if (value && value.trim()) {
      params.set(`text_${key}`, value.trim());
    }
  });

  // 📅 Date Filters
  Object.entries(state.filters.date).forEach(([key, value]) => {
    if (value) {
      params.set(`date_${key}`, value.toISOString().split("T")[0]); // YYYY-MM-DD format
    }
  });

  // 📅 Date Range Filters
  Object.entries(state.filters.dateRange).forEach(([key, range]) => {
    if (range.from || range.to) {
      const rangeValue = [
        range.from ? range.from.toISOString().split("T")[0] : "",
        range.to ? range.to.toISOString().split("T")[0] : "",
      ].join("|");
      params.set(`daterange_${key}`, rangeValue);
    }
  });

  // 🔢 Number Filters
  Object.entries(state.filters.number).forEach(([key, value]) => {
    if (value !== undefined) {
      params.set(`num_${key}`, value.toString());
    }
  });

  // 🔢 Number Range Filters
  Object.entries(state.filters.numberRange).forEach(([key, range]) => {
    if (range.min !== undefined || range.max !== undefined) {
      const rangeValue = [
        range.min !== undefined ? range.min.toString() : "",
        range.max !== undefined ? range.max.toString() : "",
      ].join("|");
      params.set(`numrange_${key}`, rangeValue);
    }
  });

  return params;
}

/**
 * Chuyển đổi URL query parameters thành partial state object
 * @param searchParams - URLSearchParams hoặc string query
 * @returns Partial state object có thể dùng làm initialState
 */
export function urlQueryToState<T>(
  searchParams: URLSearchParams | string,
  defaultLimit = 10
): Partial<TableState<T>> {
  const params =
    typeof searchParams === "string"
      ? new URLSearchParams(searchParams)
      : searchParams;

  const state: Partial<TableState<T>> = {
    pagination: {
      currentPage: 1,
      pageSize: defaultLimit,
      totalPages: 0,
      totalItems: 0,
      startIndex: 0,
      endIndex: 0,
    },
    search: "",
    sort: { key: null, direction: "asc" },
    filters: {
      select: {},
      text: {},
      date: {},
      dateRange: {},
      number: {},
      numberRange: {},
    },
  };

  // 📄 Pagination
  const page = params.get("page");
  const size = params.get("size");

  if (page) {
    const pageNum = Number.parseInt(page, defaultLimit);
    if (!isNaN(pageNum) && pageNum > 0) {
      state.pagination!.currentPage = pageNum;
    }
  }

  if (size) {
    const sizeNum = Number.parseInt(size, defaultLimit);
    if (!isNaN(sizeNum) && sizeNum > 0) {
      state.pagination!.pageSize = sizeNum;
    }
  }

  // 🔍 Search
  const search = params.get("search");
  if (search) {
    state.search = decodeURIComponent(search);
  }

  // 🔄 Sort
  const sort = params.get("sort");
  const dir = params.get("dir");

  if (sort) {
    state.sort!.key = sort as keyof T;
    state.sort!.direction = dir === "desc" ? "desc" : "asc";
  }

  // 🎯 Parse all filter parameters
  for (const [key, value] of params.entries()) {
    if (!value) continue;

    try {
      // Select Filters (filter_*)
      if (key.startsWith("filter_")) {
        const filterKey = key.replace("filter_", "");
        state.filters!.select![filterKey] = value
          .split(",")
          .filter((v) => v.trim());
      }

      // Text Filters (text_*)
      else if (key.startsWith("text_")) {
        const filterKey = key.replace("text_", "");
        state.filters!.text![filterKey] = decodeURIComponent(value);
      }

      // Date Filters (date_*)
      else if (key.startsWith("date_")) {
        const filterKey = key.replace("date_", "");
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          state.filters!.date![filterKey] = date;
        }
      }

      // Date Range Filters (daterange_*)
      else if (key.startsWith("daterange_")) {
        const filterKey = key.replace("daterange_", "");
        const [fromStr, toStr] = value.split("|");
        const range: { from?: Date; to?: Date } = {};

        if (fromStr) {
          const fromDate = new Date(fromStr);
          if (!isNaN(fromDate.getTime())) {
            range.from = fromDate;
          }
        }

        if (toStr) {
          const toDate = new Date(toStr);
          if (!isNaN(toDate.getTime())) {
            range.to = toDate;
          }
        }

        if (range.from || range.to) {
          state.filters!.dateRange![filterKey] = range;
        }
      }

      // Number Filters (num_*)
      else if (key.startsWith("num_")) {
        const filterKey = key.replace("num_", "");
        const num = Number.parseFloat(value);
        if (!isNaN(num)) {
          state.filters!.number![filterKey] = num;
        }
      }

      // Number Range Filters (numrange_*)
      else if (key.startsWith("numrange_")) {
        const filterKey = key.replace("numrange_", "");
        const [minStr, maxStr] = value.split("|");
        const range: { min?: number; max?: number } = {};

        if (minStr) {
          const min = Number.parseFloat(minStr);
          if (!isNaN(min)) {
            range.min = min;
          }
        }

        if (maxStr) {
          const max = Number.parseFloat(maxStr);
          if (!isNaN(max)) {
            range.max = max;
          }
        }

        if (range.min !== undefined || range.max !== undefined) {
          state.filters!.numberRange![filterKey] = range;
        }
      }
    } catch (error) {
      console.warn(`Failed to parse URL parameter ${key}:`, error);
    }
  }

  return state;
}

/**
 * Helper function để tạo shareable URL với current state
 * @param baseUrl - Base URL (thường là window.location.origin + pathname)
 * @param state - TableState object
 * @returns Complete URL string
 */
export function createShareableURL<T>(
  baseUrl: string,
  state: TableState<T>
): string {
  const params = stateToURLQuery(state);
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Helper function để update browser URL mà không reload page
 * @param state - TableState object
 * @param replaceState - Dùng replaceState thay vì pushState (default: true)
 */
export function updateBrowserURL<T>(
  state: TableState<T>,
  replaceState = true
): void {
  const params = stateToURLQuery(state);
  const queryString = params.toString();
  const newUrl = queryString
    ? `${window.location.pathname}?${queryString}`
    : window.location.pathname;

  if (replaceState) {
    window.history.replaceState({}, "", newUrl);
  } else {
    window.history.pushState({}, "", newUrl);
  }
}

/**
 * Helper function để get current URL params
 * @returns URLSearchParams từ current URL
 */
export function getCurrentURLParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

/**
 * Helper function để compress state thành base64 string (cho URL ngắn hơn)
 * @param state - TableState object
 * @returns Base64 encoded string
 */
export function compressStateToBase64<T>(
  state: TableState<T>,
  defaultLimit = 10
): string {
  const minimalState = {
    p:
      state.pagination.currentPage > 1
        ? state.pagination.currentPage
        : undefined,
    s:
      state.pagination.pageSize !== defaultLimit
        ? state.pagination.pageSize
        : undefined,
    q: state.search || undefined,
    sort: state.sort.key
      ? {
          k: state.sort.key,
          d: state.sort.direction !== "asc" ? state.sort.direction : undefined,
        }
      : undefined,
    f: {
      sel:
        Object.keys(state.filters.select).length > 0
          ? state.filters.select
          : undefined,
      txt:
        Object.keys(state.filters.text).length > 0
          ? state.filters.text
          : undefined,
      dt:
        Object.keys(state.filters.date).length > 0
          ? Object.fromEntries(
              Object.entries(state.filters.date).map(([k, v]) => [
                k,
                v?.toISOString(),
              ])
            )
          : undefined,
      dtr:
        Object.keys(state.filters.dateRange).length > 0
          ? Object.fromEntries(
              Object.entries(state.filters.dateRange).map(([k, v]) => [
                k,
                {
                  f: v.from?.toISOString(),
                  t: v.to?.toISOString(),
                },
              ])
            )
          : undefined,
      num:
        Object.keys(state.filters.number).length > 0
          ? state.filters.number
          : undefined,
      numr:
        Object.keys(state.filters.numberRange).length > 0
          ? state.filters.numberRange
          : undefined,
    },
  };

  // Remove undefined values
  const cleanState = JSON.parse(JSON.stringify(minimalState));
  return btoa(JSON.stringify(cleanState));
}

/**
 * Helper function để decompress base64 string thành state
 * @param base64String - Base64 encoded state
 * @returns Partial state object
 */
export function decompressStateFromBase64<T>(
  base64String: string,
  defaultLimit = 10
): Partial<TableState<T>> {
  try {
    const minimalState = JSON.parse(atob(base64String));

    const state: Partial<TableState<T>> = {
      pagination: {
        currentPage: minimalState.p || 1,
        pageSize: minimalState.s || defaultLimit,
        totalPages: 0,
        totalItems: 0,
        startIndex: 0,
        endIndex: 0,
      },
      search: minimalState.q || "",
      sort: {
        key: minimalState.sort?.k || null,
        direction: minimalState.sort?.d || "asc",
      },
      filters: {
        select: minimalState.f?.sel || {},
        text: minimalState.f?.txt || {},
        date: minimalState.f?.dt
          ? Object.fromEntries(
              Object.entries(minimalState.f.dt).map(([k, v]) => [
                k,
                new Date(v as string),
              ])
            )
          : {},
        dateRange: minimalState.f?.dtr
          ? Object.fromEntries(
              Object.entries(minimalState.f.dtr).map(
                ([k, v]: [string, any]) => [
                  k,
                  {
                    from: v.f ? new Date(v.f) : undefined,
                    to: v.t ? new Date(v.t) : undefined,
                  },
                ]
              )
            )
          : {},
        number: minimalState.f?.num || {},
        numberRange: minimalState.f?.numr || {},
      },
    };

    return state;
  } catch (error) {
    console.error("Failed to decompress state from base64:", error);
    return {};
  }
}

/**
 * Cập nhật từng phần của URLSearchParams
 */
export function updateURLQueryPartially<T>(
  currentParams: URLSearchParams,
  partial: DeepPartial<TableState<T>>,
  defaultLimit = 10
): URLSearchParams {
  const params = new URLSearchParams(currentParams.toString()); // Clone

  // 📄 Pagination
  if (partial.pagination) {
    if (partial.pagination.currentPage !== undefined) {
      if (partial.pagination.currentPage > 1) {
        params.set("page", partial.pagination.currentPage.toString());
      } else {
        params.delete("page");
      }
    }

    if (partial.pagination.pageSize !== undefined) {
      if (partial.pagination.pageSize !== defaultLimit) {
        params.set("size", partial.pagination.pageSize.toString());
      } else {
        params.delete("size");
      }
    }
  }

  // 🔍 Search
  if (partial.search !== undefined) {
    const val = partial.search.trim();
    if (val) {
      params.set("search", val);
    } else {
      params.delete("search");
    }
  }

  // 🔄 Sort
  if (partial.sort) {
    if (partial.sort.key) {
      params.set("sort", String(partial.sort.key));
      if (partial.sort.direction && partial.sort.direction !== "asc") {
        params.set("dir", partial.sort.direction);
      } else {
        params.delete("dir");
      }
    } else {
      params.delete("sort");
      params.delete("dir");
    }
  }

  // 🎯 Filters
  const filters = partial.filters;

  // // Select
  // if (filters?.select) {
  //   Object.entries(filters.select).forEach(([key, values]) => {
  //     if (values.length > 0) {
  //       params.set(`filter_${key}`, values.join(","));
  //     } else {
  //       params.delete(`filter_${key}`);
  //     }
  //   });
  // }

  // Text
  if (filters?.text) {
    Object.entries(filters.text).forEach(([key, value]) => {
      if (value && value.trim()) {
        params.set(`text_${key}`, value.trim());
      } else {
        params.delete(`text_${key}`);
      }
    });
  }

  // Date
  if (filters?.date) {
    Object.entries(filters.date).forEach(([key, value]) => {
      if (value) {
        params.set(`date_${key}`, value.toISOString().split("T")[0]);
      } else {
        params.delete(`date_${key}`);
      }
    });
  }

  // DateRange
  if (filters?.dateRange) {
    Object.entries(filters.dateRange).forEach(([key, range]) => {
      const from = range?.from ? range.from.toISOString().split("T")[0] : "";
      const to = range?.to ? range.to.toISOString().split("T")[0] : "";
      if (from || to) {
        params.set(`daterange_${key}`, `${from}|${to}`);
      } else {
        params.delete(`daterange_${key}`);
      }
    });
  }

  // Number
  if (filters?.number) {
    Object.entries(filters.number).forEach(([key, value]) => {
      if (value !== undefined) {
        params.set(`num_${key}`, value.toString());
      } else {
        params.delete(`num_${key}`);
      }
    });
  }

  // NumberRange
  if (filters?.numberRange) {
    Object.entries(filters.numberRange).forEach(([key, range]) => {
      const min = range?.min !== undefined ? range.min.toString() : "";
      const max = range?.max !== undefined ? range.max.toString() : "";
      if (min || max) {
        params.set(`numrange_${key}`, `${min}|${max}`);
      } else {
        params.delete(`numrange_${key}`);
      }
    });
  }

  return params;
}

export function isStatesEmpty<T>(
  state: TableState<T> | undefined,
  options: { includeSearch?: boolean; includeSort?: boolean } = {}
): boolean {
  if (!state) return true;

  const { filters, search, sort } = state;
  const { includeSearch = false, includeSort = false } = options;

  // Check từng nhóm filter
  const hasSelect = Object.values(filters.select).some(
    (arr) => arr && arr.length > 0
  );

  const hasText = Object.values(filters.text).some(
    (val) => val !== undefined && val.trim() !== ""
  );

  const hasDate = Object.values(filters.date).some(
    (val) => val instanceof Date
  );

  const hasDateRange = Object.values(filters.dateRange).some(
    (range) => range.from instanceof Date || range.to instanceof Date
  );

  const hasNumber = Object.values(filters.number).some(
    (val) => typeof val === "number" && !isNaN(val)
  );

  const hasNumberRange = Object.values(filters.numberRange).some(
    (range) =>
      (typeof range.min === "number" && !isNaN(range.min)) ||
      (typeof range.max === "number" && !isNaN(range.max))
  );

  const hasSearch = includeSearch ? search.trim() !== "" : false;

  const hasSort = includeSort ? sort.key !== null : false;

  return !(
    hasSelect ||
    hasText ||
    hasDate ||
    hasDateRange ||
    hasNumber ||
    hasNumberRange ||
    hasSearch ||
    hasSort
  );
}
