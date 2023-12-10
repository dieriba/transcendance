import { StartGameInfo } from "../../../../shared/types";
import {
  UpdatedAvatarRes,
  UserUpdateStatusType,
  UserUpdated,
} from "../../../models/login/UserSchema";
import { LeaderboardType } from "./../../../models/Leaderboard";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface AppState {
  inQueue: boolean;
  waitingReady: boolean;
  gameData: StartGameInfo | undefined;
  users: LeaderboardType[];
}

const initialState: AppState = {
  inQueue: false,
  waitingReady: false,
  gameData: undefined,
  users: [],
};

const PongSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setInQueue: (state, action: PayloadAction<boolean>) => {
      state.inQueue = action.payload;
    },
    setWaitingReady: (state, action: PayloadAction<boolean>) => {
      state.waitingReady = action.payload;
    },
    setGameData: (state, action: PayloadAction<StartGameInfo | undefined>) => {
      state.gameData = action.payload;
    },
    setLeaderboardUser: (state, action: PayloadAction<LeaderboardType[]>) => {
      state.users = action.payload;
    },
    updateUserStatus: (state, action: PayloadAction<UserUpdateStatusType>) => {
      const { ids, status } = action.payload;
      state.users.forEach((user) => {
        if (ids.includes(user.id)) {
          user.status = status;
        }
      });
    },
    updateUserInfo: (
      state,
      action: PayloadAction<UserUpdated | UpdatedAvatarRes>
    ) => {
      const index = state.users.findIndex(
        (user) => user.id === action.payload.id
      );

      if (index >= 0) {
        if ("nickname" in action.payload) {
          state.users[index].nickname = action.payload.nickname;
          return;
        }
        state.users[index].profile.avatar = (
          action.payload as UpdatedAvatarRes
        ).avatar;
      }
    },
    addNewPlayerToLeaderboard: (
      state,
      action: PayloadAction<LeaderboardType>
    ) => {
      const index = state.users.findIndex(
        (user) => user.id === action.payload.id
      );

      if (index === -1) state.users.push(action.payload);
    },
  },
});

export const {
  setInQueue,
  setWaitingReady,
  setGameData,
  setLeaderboardUser,
  updateUserStatus,
  addNewPlayerToLeaderboard,
  updateUserInfo,
} = PongSlice.actions;

export default PongSlice;
