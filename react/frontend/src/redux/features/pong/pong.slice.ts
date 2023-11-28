import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface AppState {
  inQueue: boolean;
  waitingReady: boolean;
}

const initialState: AppState = {
  inQueue: false,
  waitingReady: false,
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
  },
});

export const { setInQueue, setWaitingReady } = PongSlice.actions;

export default PongSlice;
