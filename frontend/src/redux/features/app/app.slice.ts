import { AlertColor } from "@mui/material";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface AppState {
  message: string;
  timeout?: number;
  severity: AlertColor;
  open?: boolean | undefined;
}

const initialState: AppState = {
  message: "",
  timeout: 4000,
  severity: "success",
  open: undefined,
};

const AppSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    showSnackBar: (state, action: PayloadAction<AppState>) => {
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

export const { showSnackBar, closeSnackBar } = AppSlice.actions;

export default AppSlice;
