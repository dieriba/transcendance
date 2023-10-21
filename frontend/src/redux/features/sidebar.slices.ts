import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface Sidebar {
  open: boolean;
  tab: "CONTACT" | "SHARED";
}

const initialState: Sidebar = {
  open: false,
  tab: "CONTACT",
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
