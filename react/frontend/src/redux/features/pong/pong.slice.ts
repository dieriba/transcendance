import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface AppState {
  inQueue: boolean;
  waitingReady: boolean;
  gameId: string | undefined;
}

const initialState: AppState = {
  inQueue: false,
  waitingReady: false,
  gameId: undefined,
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
    setGameId: (state, action: PayloadAction<string>) => {
      state.gameId = action.payload;
    },
  },
});

export const { setInQueue, setWaitingReady, setGameId } = PongSlice.actions;

export default PongSlice;
