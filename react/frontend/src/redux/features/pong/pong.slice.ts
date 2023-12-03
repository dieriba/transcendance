import { StartGameInfo } from "../../../../shared/types";
import { UserUpdateStatusType } from "../../../models/login/UserSchema";
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
    setGameData: (state, action: PayloadAction<StartGameInfo>) => {
      state.gameData = action.payload;
    },
    setLeaderboardUser: (state, action: PayloadAction<LeaderboardType[]>) => {
      state.users = action.payload;
    },
    updateUserStatus: (state, action: PayloadAction<UserUpdateStatusType>) => {
      const { id, status } = action.payload;

      const index = state.users.findIndex((user) => user.id === id);

      if (index === -1) return;

      state.users[index].status = status;
    },
  },
});

export const {
  setInQueue,
  setWaitingReady,
  setGameData,
  setLeaderboardUser,
  updateUserStatus,
} = PongSlice.actions;

export default PongSlice;
