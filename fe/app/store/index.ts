import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./slices/app.slice";
import queryReducer from "./slices/query-slice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    query: queryReducer,
  },
});

// Export các type dùng trong app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
