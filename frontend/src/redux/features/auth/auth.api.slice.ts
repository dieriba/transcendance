import { LoginFormType } from "../../../models/login/LoginSchema";
import { ResponseLoginType } from "../../../models/login/ResponseLogin";
import { BaseServerResponse } from "../../../services/type";
import { apiSlice } from "../../api/apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
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
  }),
});

export const { useLoginMutation } = authApiSlice;
