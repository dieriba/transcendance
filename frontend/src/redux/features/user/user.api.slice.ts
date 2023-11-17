import { BaseServerResponse } from "./../../../services/type";
import { RegisterFormType } from "../../../models/RegisterSchema";
import { LoginFormType } from "../../../models/login/LoginSchema";
import { ResponseLoginType } from "../../../models/login/ResponseLogin";
import { apiSlice } from "../../api/apiSlice";

const dataForm = (file:Blob) => {
  const formData = new FormData();
  formData.append("archivo", file); // "archivo" is the key that expects my backend for the file
  return formData;
}

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
      BaseServerResponse & {
        data: { message: string; statusCode: number; data: string };
      },
      Blob
    >({
      query: (file) => {
        const formData = new FormData();
        formData.append("avatar", file);
        console.log({ formData, file });
        return {
          url: "/files/upload-avatar",
          method: "POST",
          body: dataForm(file),
        };
      },
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
