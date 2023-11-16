import { RegisterFormType } from "../../../models/RegisterSchema";
import { LoginFormType } from "../../../models/login/LoginSchema";
import { ResponseLoginType } from "../../../models/login/ResponseLogin";
import { BaseServerResponse } from "../../../services/type";
import { apiSlice } from "../../api/apiSlice";

export const UserApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      BaseServerResponse & { data: ResponseLoginType },
      LoginFormType
    >({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "PATCH",
      }),
    }),
    register: builder.mutation<
      BaseServerResponse & { data: unknown },
      RegisterFormType
    >({
      query: (data) => ({
        url: "/auth/signup",
        method: "POST",
        body: data,
      }),
    }),
    oauth: builder.query<
      BaseServerResponse & { data: ResponseLoginType },
      { code: string }
    >({
      query: (data) => ({
        url: `/auth/oauth_callback/${data.code}`,
      }),
    }),
    changeAvatar: builder.mutation<
      BaseServerResponse & { data: string },
      FormData
    >({
      query: (data) => ({
        url: "/files/upload-avatar",
        method: "POST",
        body: data,
        Accept: "*/*",
        formData: true,
        headers: {
          contentType: undefined,
        },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useOauthQuery,
  useLogoutMutation,
  useChangeAvatarMutation,
} = UserApiSlice;
