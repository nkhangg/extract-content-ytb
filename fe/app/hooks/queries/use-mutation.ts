import { useState, useCallback, useRef } from "react";
import { delay as dl } from "@/features/delay";

interface UseMutationOptions<TData, TVariables, TError> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
  onSettled?: (
    data: TData | null,
    error: TError | null,
    variables: TVariables
  ) => void;
  delay?: number;
}

interface UseMutationResult<TData, TVariables, TError> {
  data: TData | null;
  error: TError | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  mutate: (variables: TVariables) => Promise<void>;
  mutateSync: (variables: TVariables) => Promise<TData>;
  reset: () => void;
}

export function useMutation<
  TData = unknown,
  TVariables = void,
  TError = unknown
>(
  options: UseMutationOptions<TData, TVariables, TError>
): UseMutationResult<TData, TVariables, TError> {
  const { mutationFn, onSuccess, onError, onSettled, delay } = options;

  if (typeof mutationFn !== "function") {
    throw new Error("mutationFn must be a function that returns a promise");
  }

  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<TError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const isMounted = useRef(true);

  const mutate = useCallback(
    async (variables: TVariables) => {
      setIsLoading(true);
      setIsSuccess(false);
      setIsError(false);
      setError(null);

      try {
        if (delay) {
          await dl(delay);
        }

        const result = await mutationFn(variables);
        if (isMounted.current) {
          setData(result);
          setIsSuccess(true);
          onSuccess?.(result, variables);
          onSettled?.(result, null, variables);
        }
      } catch (err) {
        if (isMounted.current) {
          const castedError = err as TError;
          setError(castedError);
          setIsError(true);
          onError?.(castedError, variables);
          onSettled?.(null, castedError, variables);
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    },
    [mutationFn, onSuccess, onError, onSettled]
  );

  // ✅ mutateSync mới, trả về trực tiếp kết quả
  const mutateSync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setIsLoading(true);
      setIsSuccess(false);
      setIsError(false);
      setError(null);

      try {
        if (delay) {
          await dl(delay);
        }

        const result = await mutationFn(variables);

        if (isMounted.current) {
          setData(result);
          setIsSuccess(true);
          onSuccess?.(result, variables);
          onSettled?.(result, null, variables);
        }

        return result; // ✅ trả về kết quả
      } catch (err) {
        if (isMounted.current) {
          const castedError = err as TError;
          setError(castedError);
          setIsError(true);
          onError?.(castedError, variables);
          onSettled?.(null, castedError, variables);
        }
        throw err; // ✅ để bên ngoài bắt lỗi qua try/catch
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    },
    [mutationFn, onSuccess, onError, onSettled, delay]
  );

  const reset = useCallback(() => {
    if (!isMounted.current) return;
    setData(null);
    setError(null);
    setIsLoading(false);
    setIsSuccess(false);
    setIsError(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    isSuccess,
    isError,
    mutate,
    mutateSync,
    reset,
  };
}
