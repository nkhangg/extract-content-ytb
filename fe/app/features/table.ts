import type { DeepPartial } from "react-hook-form";
import type { TableState } from "@/components/core/data-table";

// export function mapTableStateToPaginationQueryDSL<T>(
//   state: TableState<T>
// ): Record<string, string> {
//   const { pagination, search, sort, filters } = state;
//   const query: Record<string, string> = {};

//   // Pagination
//   query.page = pagination.currentPage.toString();
//   query.limit = pagination.pageSize.toString();

//   // Global search
//   if (search) {
//     query.search = search;
//   }

//   // Sort (e.g., sort=createdAt:desc)
//   if (sort?.key) {
//     query.sortBy = `${String(sort.key)}:${sort.direction.toUpperCase()}`;
//   }

//   // ====== FILTERS: bắt đầu với filter.<field> = $operator:value ======

//   // 1. select -> $in
//   for (const [field, values] of Object.entries(filters.select || {})) {
//     if (Array.isArray(values) && values.length > 0) {
//       query[`filter.${field}`] = `$in:${values.join(",")}`;
//     }
//   }

//   // 2. text -> $cont (contains, LIKE)
//   for (const [field, value] of Object.entries(filters.text || {})) {
//     if (value) {
//       query[`filter.${field}`] = `$ilike:${value}`;
//     }
//   }

//   // 3. dateRange -> $btw
//   for (const [field, { from, to }] of Object.entries(filters.dateRange || {})) {
//     if (from && to) {
//       query[`filter.${field}`] = `$btw:${from.toISOString().split("T")[0]},${
//         to.toISOString().split("T")[0]
//       }`;
//     } else if (from) {
//       query[`filter.${field}`] = `$gte:${from.toISOString().split("T")[0]}`;
//     } else if (to) {
//       query[`filter.${field}`] = `$lte:${to.toISOString().split("T")[0]}`;
//     }
//   }

//   // 4. numberRange -> $gte / $lte / $btw
//   for (const [field, { min, max }] of Object.entries(
//     filters.numberRange || {}
//   )) {
//     if (min != null && max != null) {
//       query[`filter.${field}`] = `$btw:${min},${max}`;
//     } else if (min != null) {
//       query[`filter.${field}`] = `$gte:${min}`;
//     } else if (max != null) {
//       query[`filter.${field}`] = `$lte:${max}`;
//     }
//   }

//   // 5. number -> $eq
//   for (const [field, value] of Object.entries(filters.number || {})) {
//     if (value != null) {
//       query[`filter.${field}`] = `$eq:${value}`;
//     }
//   }

//   // 6. date -> $eq
//   for (const [field, value] of Object.entries(filters.date || {})) {
//     if (value) {
//       query[`filter.${field}`] = `$eq:${value.toISOString().split("T")[0]}`;
//     }
//   }

//   return query;
// }

export function mapTableStateToPaginationQueryDSL<T>(
  state: DeepPartial<TableState<T>>
): Record<string, string> {
  const { pagination, search, sort, filters } = state || {};
  const query: Record<string, string> = {};

  // Pagination
  if (pagination?.currentPage != null) {
    query.page = pagination.currentPage.toString();
  }
  if (pagination?.pageSize != null) {
    query.limit = pagination.pageSize.toString();
  }

  // Global search
  if (search) {
    query.search = search;
  }

  // Sort
  if (sort?.key && sort?.direction) {
    query.sortBy = `${String(sort.key)}:${sort.direction.toUpperCase()}`;
  }

  // === FILTERS ===
  const f = filters || {};

  // 1. select -> $in
  Object.entries(f.select || {}).forEach(([field, values]) => {
    if (Array.isArray(values) && values.length > 0) {
      query[`filter.${field}`] = `$in:${values.join(",")}`;
    }
  });

  // 2. text -> $ilike
  Object.entries(f.text || {}).forEach(([field, value]) => {
    if (value) {
      query[`filter[${field}]`] = `$ilike:${value}`;
    }
  });

  // 3. dateRange -> $btw, $gte, $lte
  Object.entries(f.dateRange || {}).forEach(([field, range]) => {
    const from = range?.from;
    const to = range?.to;
    if (from && to) {
      query[`filter.${field}`] = `$btw:${from.toISOString().split("T")[0]},${
        to.toISOString().split("T")[0]
      }`;
    } else if (from) {
      query[`filter.${field}`] = `$gte:${from.toISOString().split("T")[0]}`;
    } else if (to) {
      query[`filter.${field}`] = `$lte:${to.toISOString().split("T")[0]}`;
    }
  });

  // 4. numberRange -> $btw, $gte, $lte
  Object.entries(f.numberRange || {}).forEach(([field, range]) => {
    const min = range?.min;
    const max = range?.max;
    if (min != null && max != null) {
      query[`filter.${field}`] = `$btw:${min},${max}`;
    } else if (min != null) {
      query[`filter.${field}`] = `$gte:${min}`;
    } else if (max != null) {
      query[`filter.${field}`] = `$lte:${max}`;
    }
  });

  // 5. number -> $eq
  Object.entries(f.number || {}).forEach(([field, value]) => {
    if (value != null) {
      query[`filter.${field}`] = `$eq:${value}`;
    }
  });

  // 6. date -> $eq
  Object.entries(f.date || {}).forEach(([field, value]) => {
    if (value) {
      query[`filter.${field}`] = `$eq:${value.toISOString().split("T")[0]}`;
    }
  });

  // 7. not -> $not
  Object.entries(f.not || {}).forEach(([field, value]) => {
    if (value != null) {
      query[`filter.${field}`] = `$not:${value}`;
    }
  });

  return query;
}

export function mapTableStateToSpatieQuery<T>(
  state: DeepPartial<TableState<T>>
): Record<string, string> {
  const { pagination, search, sort, filters } = state || {};
  const query: Record<string, string> = {};

  // Pagination
  if (pagination?.currentPage != null) {
    query.page = pagination.currentPage.toString();
  }
  if (pagination?.pageSize != null) {
    query.limit = pagination.pageSize.toString();
  }

  // Global search (nếu backend có xử lý)
  if (search) {
    query[`filter[search]`] = search;
  }

  // Sort: spatie dùng sort=field hoặc sort=-field
  if (sort?.key && sort?.direction) {
    query.sort =
      sort.direction === "desc" ? `-${String(sort.key)}` : String(sort.key);
  }

  // Filters
  const f = filters || {};

  // 1. select / multiple -> filter[field]=value1,value2
  Object.entries(f.select || {}).forEach(([field, values]) => {
    if (Array.isArray(values) && values.length > 0) {
      query[`filter[${field}]`] = values.join(",");
    }
  });

  // 2. text -> filter[field]=value
  Object.entries(f.text || {}).forEach(([field, value]) => {
    if (value) {
      query[`filter[${field}]`] = value;
    }
  });

  // 3. numberRange -> filter[field]=min,max
  Object.entries(f.numberRange || {}).forEach(([field, range]) => {
    const min = range?.min;
    const max = range?.max;
    if (min != null && max != null) {
      query[`filter[${field}]`] = `${min},${max}`;
    } else if (min != null) {
      query[`filter[${field}]`] = `${min},`;
    } else if (max != null) {
      query[`filter[${field}]`] = `,${max}`;
    }
  });

  // 4. number / date / eq -> filter[field]=value
  Object.entries(f.number || {}).forEach(([field, value]) => {
    if (value != null) query[`filter[${field}]`] = value.toString();
  });
  Object.entries(f.date || {}).forEach(([field, value]) => {
    if (value) query[`filter[${field}]`] = value.toISOString().split("T")[0];
  });

  // 5. not -> spatie không có native support, backend phải parse
  Object.entries(f.not || {}).forEach(([field, value]) => {
    if (value != null) query[`filter[${field}]`] = `!${value}`;
  });

  return query;
}
