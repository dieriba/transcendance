import {
  BaseServerResponse,
  SocketServerSucessResponse,
} from "./../../../services/type";
import { RegisterFormType } from "../../../models/RegisterSchema";
import { LoginFormType } from "../../../models/login/LoginSchema";
import { ResponseLoginType } from "../../../models/login/ResponseLogin";
import { apiSlice } from "../../api/apiSlice";
import { GeneralEvent } from "../../../../../shared/socket.event";
import { connectSocket, socket } from "../../../utils/getSocket";
import { UpdateUserType } from "../../../models/login/UserSchema";

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
      FormData
    >({
      query: (formData) => {
        return {
          url: "/files/upload-avatar",
          method: "POST",
          body: formData,
        };
      },
    }),
    notifyNewProfilePic: builder.mutation<null, { avatar: string }>({
      queryFn: (data) => {
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(GeneralEvent.NEW_PROFILE_PICTURE, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });
        });
      },
    }),
    updateUser: builder.mutation<
      SocketServerSucessResponse & { data: { nickname: string } },
      UpdateUserType
    >({
      queryFn: (data) => {
        connectSocket();
        return new Promise((resolve) => {
          socket.emit(GeneralEvent.UPDATE_USER, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            resolve({ error });
          });
        });
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
  useNotifyNewProfilePicMutation,
  useUpdateUserMutation,
} = UserApiSlice;
