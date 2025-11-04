import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000,
      // staleTime: 5 * 60 * 1000, // 5 phút: không refetch lại khi component mount lại
      refetchOnWindowFocus: false, // không tự động refetch khi chuyển tab
      refetchOnReconnect: false, // không tự động refetch khi mạng reconnect
      retry: false, // không tự động retry khi lỗi
    },
  },
});
