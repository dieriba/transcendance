/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../config";
import { RootState } from "../store";
import { logout, newAccessToken } from "../features/user/user.slice";
import { ServerTokenResponse } from "../../models/login/AccessTokenSchema";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).user.access_token;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshResult = await baseQuery("/auth/refresh", api, extraOptions);
    const access_token = (refreshResult.data as ServerTokenResponse).data
      .access_token;
    if (refreshResult.data) {
      api.dispatch(newAccessToken(access_token));

      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }
  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  reducerPath: "api",
  endpoints: () => ({}),
  tagTypes: ["ReceivedFriendRequest", "SentFriendRequest"],
});
