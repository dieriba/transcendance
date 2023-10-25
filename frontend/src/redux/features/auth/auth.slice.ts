import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface User {
  id: string | undefined;
  nickname: string | undefined;
  isAuthenticated: boolean;
}

interface UserInfo {
  user: User | undefined;
  token: string | undefined;
}

const initialState: UserInfo = {
  user: {
    id: undefined,
    nickname: undefined,
    isAuthenticated: false,
  },
  token: undefined,
};

export const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authenticateUser: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
    },
    newToken: (state, action: PayloadAction<{ access_token: string }>) => {
      state.token = action.payload.access_token;
    },
    logout: (state) => {
      state.user = undefined;
      state.token = undefined;
    },
  },
});

export const { authenticateUser, newToken, logout } = AuthSlice.actions;
export default AuthSlice.reducer;
