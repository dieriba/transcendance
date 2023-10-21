import { configureStore } from "@reduxjs/toolkit";
import { persistStore as persisStore } from "redux-persist";
import { combineReducers } from "@reduxjs/toolkit";
import persistReducer from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage";
import { SidebarSlice } from "./features/sidebar.slices";

const persistConfig = {
  keyPrefix: "redux-",
  key: "root",
  storage,
};

const reducer = combineReducers({ sidebar: SidebarSlice.reducer });

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const persistStore = persisStore(store);
