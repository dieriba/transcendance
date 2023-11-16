import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ResponseLoginType } from "../../../models/login/ResponseLogin";
import { AccessTokenType } from "../../../models/login/AccessTokenSchema";

export interface User {
  id: string | undefined;
  nickname: string | undefined;
  allowForeignToDm: boolean;
}

export interface UserInfo {
  user: User | undefined;
  access_token: string | undefined;
}

const initialState: UserInfo = {
  user: {
    id: undefined,
    nickname: undefined,
    allowForeignToDm: false,
  },
  access_token: undefined,
};

export const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authenticateUser: (state, action: PayloadAction<ResponseLoginType>) => {
      const { user, access_token } = action.payload;
      state.user = user;
      state.access_token = access_token;
    },
    newAccessToken: (state, action: PayloadAction<AccessTokenType>) => {
      state.access_token = action.payload.access_token;
    },
    logout: (state) => {
      state.user = undefined;
      state.access_token = undefined;
    },
  },
});

export const { authenticateUser, newAccessToken, logout } = AuthSlice.actions;
export default AuthSlice.reducer;
