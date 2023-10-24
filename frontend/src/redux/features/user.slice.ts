import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface UserInfo {
  isAuthenticated: boolean;
  id: string | undefined;
  nickname: string | undefined;
}

const initialState: UserInfo = {
  isAuthenticated: false,
  id: undefined,
  nickname: undefined,
};

export const UserInfoSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    authenticateUser: (
      state,
      action: PayloadAction<{ id: string; nickname: string }>
    ) => {
      state.isAuthenticated = true;
      state.id = action.payload.id;
      state.nickname = action.payload.nickname;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.id = undefined;
      state.nickname = undefined;
    },
  },
});

export const { authenticateUser, logout } = UserInfoSlice.actions;
export default UserInfoSlice.reducer;
