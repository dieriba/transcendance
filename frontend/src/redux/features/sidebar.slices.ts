import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface Sidebar {
  tab: "CONTACT" | "SHARED";
  open: boolean;
}

export const CONTACT: typeof initialState.tab = "CONTACT";
export const SHARED: typeof initialState.tab = "SHARED";

const initialState: Sidebar = {
  tab: CONTACT,
  open: false,
};

export const SidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggle: (state) => {
      state.open = !state.open;
    },
    closeSidebar: (state) => {
      state.open = false;
    },
    switchSidebarTab: (
      state,
      action: PayloadAction<{ tab: typeof initialState.tab }>
    ) => {
      state.tab = action.payload.tab;
    },
  },
});

export const { toggle, switchSidebarTab, closeSidebar } = SidebarSlice.actions;
export const selectTab = (state: RootState) => state.sidebar.tab;
export default SidebarSlice.reducer;
