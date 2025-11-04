import { useAppDispatch, useAppSelector } from "@/hooks/use-app-dispatch";
import {
  clearQuery,
  setQueryData,
  setQueryError,
} from "@/store/slices/query-slice";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseQueryOptions<TData> {
  queryKey: string | any[]; // có thể là string hoặc array
  queryFn: (signal?: AbortSignal) => Promise<TData>;
  enabled?: boolean;
  staleTime?: number; // ms
}

export function useQuery<TData = unknown>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = 0,
}: UseQueryOptions<TData>) {
  const dispatch = useAppDispatch();

  // chuẩn hóa key
  const key = Array.isArray(queryKey) ? JSON.stringify(queryKey) : queryKey;

  const cache = useAppSelector((state: any) => state.query[key]);

  const [isLoading, setIsLoading] = useState<boolean>(!cache?.data);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);

    try {
      const res = await queryFn(controller.signal);
      dispatch(setQueryData({ key, data: res }));
    } catch (err: any) {
      console.log({ err });
      if (!controller.signal.aborted) {
        dispatch(setQueryError({ key, error: err }));
      }
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, key, queryFn, enabled]);

  useEffect(() => {
    const isStale =
      !cache?.updatedAt || Date.now() - cache.updatedAt > staleTime;

    if (enabled && isStale) {
      fetchData();
    }

    return () => {
      if (abortRef.current) abortRef.current.abort();
      dispatch(clearQuery(key)); // clear khi unmount
    };
  }, [key, enabled, staleTime]);

  return {
    data: cache?.data ?? null,
    error: cache?.error ?? null,
    isLoading,
    isSuccess: !!cache?.data && !isLoading && !cache?.error,
    isError: !!cache?.error,
    refetch: fetchData,
  };
}
