import { AlertColor } from "@mui/material";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface AppNotify {
  message: string;
  timeout?: number;
  severity: AlertColor;
  open?: boolean | undefined;
}

const initialState: AppNotify = {
  message: "",
  timeout: 4000,
  severity: "success",
  open: undefined,
};

const AppNotifySlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    showSnackBar: (state, action: PayloadAction<AppNotify>) => {
      const { message, timeout, severity } = action.payload;
      state.open = true;
      state.timeout = timeout ? timeout : state.timeout;
      state.message = message;
      state.severity = severity;
    },
    closeSnackBar: (state) => {
      state.open = false;
      state.message = "";
    },
  },
});

export const { showSnackBar, closeSnackBar } = AppNotifySlice.actions;

export default AppNotifySlice;
