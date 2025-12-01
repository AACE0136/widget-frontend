import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  user: { email: string; name?: string } | null;
  authMethod: "basic" | "sso" | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  authMethod: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        email: string;
        name?: string;
        method?: "basic" | "sso";
      }>
    ) => {
      state.isAuthenticated = true;
      state.user = { email: action.payload.email, name: action.payload.name };
      state.authMethod = action.payload.method || "basic";
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.authMethod = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
