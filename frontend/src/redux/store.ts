import { AnyAction, configureStore } from "@reduxjs/toolkit";
import { persistStore as persisStore } from "redux-persist";
import { combineReducers } from "@reduxjs/toolkit";
import persistReducer from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage";
import { SidebarSlice } from "./features/sidebar.slices";
import { apiSlice } from "./api/apiSlice";
import crashMiddleware from "./middleware/crashMiddleware";
import { ChatSlice } from "./features/chat/chat.slice";
import { LOGOUT } from "./type";
import { FriendsSlice } from "./features/friends/friends.slice";
import { GroupSlice } from "./features/groups/group.slice";
import AppSlice from "./features/app/app.slice";
import { UserSlice } from "./features/user/user.slice";

const persistConfig = {
  keyPrefix: "redux-",
  key: "root",
  storage,
};

const reducers = combineReducers({
  app: AppSlice.reducer,
  sidebar: SidebarSlice.reducer,
  user: UserSlice.reducer,
  chat: ChatSlice.reducer,
  friends: FriendsSlice.reducer,
  groups: GroupSlice.reducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

const rootReducer = (
  state: ReturnType<typeof reducers> | undefined,
  action: AnyAction
) => {
  if (action.type === LOGOUT) {
    storage.removeItem("redux-root");
    return reducers(undefined, { type: undefined });
  }

  return reducers(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).concat([apiSlice.middleware, crashMiddleware]),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const persistStore = persisStore(store);
