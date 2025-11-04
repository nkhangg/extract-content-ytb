// querySlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface QueryCacheItem<T = any> {
  data: T | null;
  error: any;
  updatedAt: number;
}

interface QueryState {
  [key: string]: QueryCacheItem;
}

const initialState: QueryState = {};

export const querySlice = createSlice({
  name: "query",
  initialState,
  reducers: {
    setQueryData: <T>(
      state: any,
      action: PayloadAction<{ key: string; data: T }>
    ) => {
      state[action.payload.key] = {
        data: action.payload.data,
        error: null,
        updatedAt: Date.now(),
      };
    },
    setQueryError: (
      state,
      action: PayloadAction<{ key: string; error: any }>
    ) => {
      state[action.payload.key] = {
        data: null,
        error: action.payload.error,
        updatedAt: Date.now(),
      };
    },
    clearQuery: (state, action: PayloadAction<string>) => {
      delete state[action.payload];
    },
    clearAllQueries: () => initialState,
  },
});

export const { setQueryData, setQueryError, clearQuery, clearAllQueries } =
  querySlice.actions;

export default querySlice.reducer;
