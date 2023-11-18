import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ResponseLoginType } from "../../../models/login/ResponseLogin";
import { AccessTokenType } from "../../../models/login/AccessTokenSchema";

export interface User {
  id: string | undefined;
  nickname: string | undefined;
  allowForeignToDm: boolean;
  twoFa: boolean;
  profile: {
    avatar?: string | undefined | null;
    lastname: string;
    firstname: string;
  };
}

export interface UserInfo {
  user: User | undefined;
  access_token: string | undefined;
}

const initialState: UserInfo = {
  user: {
    id: undefined,
    nickname: undefined,
    twoFa: false,
    allowForeignToDm: false,
    profile: {
      avatar: undefined,
      lastname: "",
      firstname: "",
    },
  },

  access_token: undefined,
};

export const UserSlice = createSlice({
  name: "user",
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
    setNewAvatarSrc: (state, action: PayloadAction<string>) => {
      (state.user as User).profile.avatar = action.payload;
    },
    setNewNickname: (state, action: PayloadAction<string>) => {
      if (state.user) state.user.nickname = action.payload;
    },
    updatedTwoFa: (state, action: PayloadAction<boolean>) => {
      (state.user as User).twoFa = action.payload;
    },
    logout: (state) => {
      state.user = undefined;
      state.access_token = undefined;
    },
  },
});

export const {
  authenticateUser,
  newAccessToken,
  setNewAvatarSrc,
  setNewNickname,
  logout,
  updatedTwoFa,
} = UserSlice.actions;
export default UserSlice.reducer;
