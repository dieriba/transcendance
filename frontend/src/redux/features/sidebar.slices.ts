import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface Sidebar {
  tab: "CONTACT" | "SHARED";
  open: boolean;
  openGroupSidebar: boolean;
}

export const CONTACT: typeof initialState.tab = "CONTACT";
export const SHARED: typeof initialState.tab = "SHARED";

const initialState: Sidebar = {
  tab: CONTACT,
  open: false,
  openGroupSidebar: false,
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
    closeGroupSidebar: (state) => {
      state.openGroupSidebar = false;
    },
    switchSidebarTab: (
      state,
      action: PayloadAction<{ tab: typeof initialState.tab }>
    ) => {
      state.tab = action.payload.tab;
    },
    toggleOpenGroupSidebar: (state) => {
      state.openGroupSidebar = !state.openGroupSidebar;
    },
  },
});

export const {
  toggle,
  toggleOpenGroupSidebar,
  switchSidebarTab,
  closeSidebar,
  closeGroupSidebar
} = SidebarSlice.actions;
export default SidebarSlice.reducer;
