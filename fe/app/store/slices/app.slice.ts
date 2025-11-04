import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AppState {
	user: IUser | null;
}

const initialState: AppState = {
	user: null,
};

const appSlice = createSlice({
	name: "app",
	initialState,
	reducers: {
		setUser(state, action: PayloadAction<IUser>) {
			state.user = action.payload;
		},
		clearUser(state) {
			state.user = null;
		},
	},
});

export const { setUser, clearUser } = appSlice.actions;
export default appSlice.reducer;
