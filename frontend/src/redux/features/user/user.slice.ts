import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ResponseLoginType } from "../../../models/login/ResponseLogin";
import { AccessTokenType } from "../../../models/login/AccessTokenSchema";

export interface User {
  id: string | undefined;
  nickname: string | undefined;
  allowForeignToDm: boolean;
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
      console.log('insde');
      
      (state.user as User).profile.avatar = action.payload;
    },
    logout: (state) => {
      state.user = undefined;
      state.access_token = undefined;
    },
  },
});

export const { authenticateUser, newAccessToken, setNewAvatarSrc, logout } =
  UserSlice.actions;
export default UserSlice.reducer;
