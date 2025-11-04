# 📊 `DataTable` Component

Component bảng dữ liệu mạnh mẽ, tùy biến cao, hỗ trợ các chức năng như tìm kiếm, lọc, phân trang, sắp xếp, hành động hàng loạt và hành động tùy chỉnh — được xây dựng bằng Tailwind, Shadcn UI, và Lucide Icons.

---

## 🚀 Cài đặt

```tsx
import { DataTable } from "@/components/data-table"; // Đường dẫn có thể khác tùy theo cấu trúc dự án
```

---

## 🧩 Props

### 1. `data: T[]`

Danh sách dữ liệu hiển thị.

### 2. `columns: Column<T>[]`

Cấu hình cột (xem bên dưới).

### 3. `searchKeys?: (keyof T)[]`

Các field dùng để tìm kiếm toàn cục.

### 4. `filterOptions?: FilterOption[]`

Cấu hình bộ lọc nâng cao (theo field, số, ngày, v.v.).

### 5. `pageSize?: number`

Số dòng mặc định mỗi trang (mặc định: 10).

### 6. `onPageSizeChange?: (size: number) => void`

Callback khi thay đổi `pageSize`.

### 7. `onRowClick?: (row: T) => void`

Sự kiện click vào 1 hàng.

### 8. `onView`, `onEdit`, `onDelete`

Callback khi người dùng chọn thao tác tương ứng từ menu hành động.

### 9. `selectable?: boolean`

Cho phép chọn nhiều dòng.

### 10. `bulkActions?: BulkAction<T>[]`

Hành động hàng loạt với các dòng được chọn.

### 11. `customActions?: CustomAction<T>[]`

Hành động tùy chỉnh cho từng dòng (menu 3 chấm).

### 12. `pagination?: PaginationData`

Phân trang điều khiển từ ngoài (server-side).

### 13. `onPaginationChange?: (pagination: PaginationData) => void`

Callback khi thay đổi phân trang.

### 14. `onSortChange`, `onFilterChange`, `onDataChange`

Callback khi sort / lọc / dữ liệu thay đổi.

### 15. `loading?: boolean`

Trạng thái đang tải dữ liệu.

---

## 🧱 Column Definition

```ts
interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  displayType?: "text" | "avatar" | "badge" | "currency" | ...;
  displayOptions?: object;
  render?: (value: any, row: T) => React.ReactNode;
}
```

> Hỗ trợ nhiều kiểu hiển thị: `text`, `password`, `image`, `badge`, `currency`, `boolean`, `link`, `email`, `tags`, `progress`, `status`, `rating`, `filesize`, `percentage`, `custom`, v.v.

---

## 🔍 Filter Options

```ts
interface FilterOption {
  key: string;
  label: string;
  type: "select" | "text" | "date" | "dateRange" | "number" | "numberRange";
  options?: { value: string; label: string }[];
}
```

> Hiển thị bộ lọc nâng cao thông qua dialog.

---

## 🔧 Bulk & Custom Actions

```ts
interface BulkAction<T> {
  key: string;
  label: string;
  action: (selected: T[]) => void;
  confirmMessage?: string;
}

interface CustomAction<T> {
  key: string;
  label: string;
  action: (row: T) => void;
  show?: (row: T) => boolean;
}
```

---

## 🟢 Hiển thị Trạng Thái (`displayType: "status"`)

Dùng để hiển thị trạng thái dưới dạng badge màu. Ví dụ các trạng thái như `"active"`, `"inactive"`, `"pending"`.

### ✅ Cú pháp:

```ts
{
  key: "status",
  label: "Trạng thái",
  displayType: "status",
  displayOptions: {
    statusMap: {
      active: {
        label: "Hoạt động",
        variant: "default",
      },
      inactive: {
        label: "Ngừng hoạt động",
        variant: "secondary",
      },
      pending: {
        label: "Đang chờ",
        variant: "outline",
      },
    },
  },
}
```

### 🎨 Tuỳ chọn nâng cao với màu cụ thể (dùng Tailwind):

```ts
{
  key: "status",
  label: "Trạng thái",
  displayType: "status",
  displayOptions: {
    statusMap: {
      active: {
        label: "Hoạt động",
        variant: "default",
        color: "bg-green-100 text-green-800 border-green-200",
      },
      inactive: {
        label: "Ngừng hoạt động",
        variant: "secondary",
        color: "bg-gray-100 text-gray-800 border-gray-200",
      },
      pending: {
        label: "Đang chờ",
        variant: "outline",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
    },
  },
}
```

> 🔁 Nếu `statusMap` không được định nghĩa:
>
> - `label` sẽ là giá trị gốc (`value`) của field
> - `variant` sẽ mặc định là `"default"`

---

## 📦 Ví dụ sử dụng

```tsx
<DataTable
  data={users}
  columns={[
    { key: "name", label: "Tên", sortable: true },
    { key: "email", label: "Email", displayType: "email" },
    {
      key: "status",
      label: "Trạng thái",
      displayType: "status",
      displayOptions: {
        statusMap: {
          active: { label: "Hoạt động", variant: "default" },
          inactive: { label: "Ngừng hoạt động", variant: "secondary" },
          pending: { label: "Đang chờ", variant: "outline" },
        },
      },
    },
  ]}
  searchKeys={["name", "email"]}
  filterOptions={[
    {
      key: "status",
      label: "Trạng thái",
      type: "select",
      options: [
        { value: "active", label: "Hoạt động" },
        { value: "inactive", label: "Ngừng hoạt động" },
        { value: "pending", label: "Đang chờ" },
      ],
    },
  ]}
  selectable
  onEdit={(row) => console.log("Edit:", row)}
  onDelete={(row) => console.log("Delete:", row)}
  bulkActions={[
    {
      key: "delete",
      label: "Xoá đã chọn",
      variant: "destructive",
      confirmMessage: "Bạn có chắc chắn muốn xoá những dòng này?",
      action: (rows) => console.log("Bulk delete:", rows),
    },
  ]}
/>
```

---

## ✅ TODO

- Export CSV / Excel
- Resizable columns
- Grouping columns
- Column reorder / drag-drop
