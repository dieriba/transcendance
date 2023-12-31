import {
  BaseServerResponse,
  SocketServerSucessResponse,
} from "./../../../services/type";
import { RegisterFormType } from "../../../models/RegisterSchema";
import { LoginFormType } from "../../../models/login/LoginSchema";
import {
  ResponseLoginType,
  ResponseTwoFaLoginType,
} from "../../../models/login/ResponseLogin";
import { apiSlice } from "../../api/apiSlice";
import { GeneralEvent } from "../../../../shared/socket.event";
import { clearSocket, connectSocket, socket } from "../../../utils/getSocket";
import {
  ChangePasswordType,
  OtpType,
  UpdateUserType,
  ValidateOtpType,
} from "../../../models/login/UserSchema";
import { Basetype } from "../../../models/BaseType";

export const UserApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      BaseServerResponse & { data: ResponseLoginType | ResponseTwoFaLoginType },
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
    disconnectAllUser: builder.mutation<void, void>({
      queryFn: () => {
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(GeneralEvent.DISCONNECT_ALL_INSTANCE_OF_ME);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ error });
          });
        });
      },
    }),
    disconnectAllExceptMe: builder.mutation<void, void>({
      queryFn: () => {
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(GeneralEvent.DISCONNECT_ALL_EXCEPT_ME);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ error });
          });
        });
      },
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
      BaseServerResponse & { data: ResponseLoginType | ResponseTwoFaLoginType },
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
          method: "PUT",
          body: formData,
        };
      },
    }),
    notifyNewProfilePic: builder.mutation<null, { avatar: string }>({
      queryFn: (data) => {
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(GeneralEvent.NEW_PROFILE_PICTURE, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
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
        return new Promise((resolve) => {
          connectSocket();

          socket.emit(GeneralEvent.UPDATE_USER_PROFILE, data);

          socket.on(GeneralEvent.SUCCESS, (data) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ data });
          });

          socket.on(GeneralEvent.EXCEPTION, (error) => {
            clearSocket([GeneralEvent.SUCCESS, GeneralEvent.EXCEPTION]);
            resolve({ error });
          });
        });
      },
    }),
    changePassword: builder.mutation<
      BaseServerResponse & { data: unknown },
      ChangePasswordType
    >({
      query: (data) => ({
        url: "/auth/change-password",
        method: "PATCH",
        body: data,
      }),
    }),
    getQrCode: builder.mutation<BaseServerResponse & { data: OtpType }, void>({
      query: () => ({
        url: "/2fa/generate",
        method: "POST",
      }),
    }),
    enable2Fa: builder.mutation<
      BaseServerResponse & { data: unknown },
      ValidateOtpType
    >({
      query: (data) => ({
        url: "/2fa/enable",
        method: "PATCH",
        body: data,
      }),
    }),
    validateOtp: builder.mutation<
      BaseServerResponse & { data: ResponseLoginType },
      ValidateOtpType & Basetype
    >({
      query: (data) => ({
        url: "/2fa/validate",
        method: "POST",
        body: data,
      }),
    }),
    update2Fa: builder.mutation<
      BaseServerResponse & { data: unknown },
      ValidateOtpType
    >({
      query: (data) => ({
        url: "/2fa/update",
        method: "PATCH",
        body: data,
      }),
    }),
    disable2Fa: builder.mutation<
      BaseServerResponse & { data: unknown },
      ValidateOtpType
    >({
      query: (data) => ({
        url: "/2fa/disable",
        method: "PATCH",
        body: data,
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
  useNotifyNewProfilePicMutation,
  useUpdateUserMutation,
  useChangePasswordMutation,
  useGetQrCodeMutation,
  useEnable2FaMutation,
  useValidateOtpMutation,
  useDisable2FaMutation,
  useUpdate2FaMutation,
  useDisconnectAllUserMutation,
  useDisconnectAllExceptMeMutation,
} = UserApiSlice;
