import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AuthUser = {
  _id?: string;
  fullname?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  profile?: {
    profilePhoto?: string;
  };
} | null;

type AuthState = {
  loading: boolean;
  hydrated: boolean;
  user: AuthUser;
};

const initialState: AuthState = {
  loading: false,
  hydrated: false,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.hydrated = true;
    },
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.hydrated = true;
    },
  },
});

export const { setLoading, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
