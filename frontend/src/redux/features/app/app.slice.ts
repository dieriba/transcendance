import { AlertColor } from "@mui/material";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface AppState {
  message: string;
  timeout?: number;
  severity: AlertColor;
  open?: boolean | undefined;
  openGameInvitation: boolean;
  senderId: string;
}

const initialState: AppState = {
  message: "",
  timeout: 4000,
  severity: "success",
  open: undefined,
  openGameInvitation: false,
  senderId: "",
};

const AppSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    showSnackBar: (state, action: PayloadAction<Partial<AppState>>) => {
      const { message, timeout, severity } = action.payload;
      state.open = true;
      state.timeout = timeout ? timeout : state.timeout;
      state.message = message as string;
      state.severity = severity as AlertColor;
    },
    closeSnackBar: (state) => {
      state.open = false;
      state.message = "";
    },
    closeGameInvitation: (state) => {
      state.openGameInvitation = false;
      state.message = "";
    },
    setGameInvitation: (
      state,
      action: PayloadAction<{ id: string; message: string }>
    ) => {
      const { id, message } = action.payload;
      state.openGameInvitation = true;
      state.senderId = id;
      state.message = message;
    },
  },
});

export const {
  showSnackBar,
  closeSnackBar,
  closeGameInvitation,
  setGameInvitation,
} = AppSlice.actions;

export default AppSlice;
