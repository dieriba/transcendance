import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import { Stack } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { PATH_APP } from "../../routes/paths";
import { useEffect } from "react";
import { connectSocket, socket } from "../../utils/getSocket";
import { FriendEvent, GeneralEvent } from "../../../../shared/socket.event";
import { SocketServerSucessResponse } from "../../services/type";
import { FriendReceivedRequestType } from "../../models/FriendRequestSchema";
import { showSnackBar } from "../../redux/features/app_notify/app.slice";
import { BaseFriendType } from "../../models/FriendsSchema";
import {
  setOfflineUser,
  setOnlineUser,
} from "../../redux/features/chat/chatSlice";

const ProtectedDashboardLayout = () => {
  const isAuthenticated = useAppSelector((state) => state.user.access_token);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();

      socket.on(
        FriendEvent.NEW_REQUEST_RECEIVED,
        (
          data: SocketServerSucessResponse & {
            data: FriendReceivedRequestType;
          }
        ) => {
          dispatch(
            showSnackBar({ message: data.message, severity: "success" })
          );
        }
      );

      socket.on(
        FriendEvent.NEW_REQUEST_ACCEPTED,
        (data: SocketServerSucessResponse & { data: BaseFriendType }) => {
          dispatch(
            showSnackBar({ message: data.message, severity: "success" })
          );
        }
      );

      socket.on(
        GeneralEvent.USER_LOGGED_OUT,
        (data: SocketServerSucessResponse & { data: BaseFriendType }) => {
          dispatch(setOfflineUser(data.data));
        }
      );

      socket.on(
        GeneralEvent.USER_LOGGED_IN,
        (data: SocketServerSucessResponse & { data: BaseFriendType }) => {
          dispatch(setOnlineUser(data.data));
        }
      );

      socket.on(
        FriendEvent.REQUEST_ACCEPTED_FROM_RECIPIENT,
        (data: SocketServerSucessResponse & { data: BaseFriendType }) => {
          dispatch(
            showSnackBar({ message: data.message, severity: "success" })
          );
        }
      );

      return () => {
        socket.off(GeneralEvent.EXCEPTION);
        socket.off(FriendEvent.REQUEST_ACCEPTED);
        socket.off(FriendEvent.NEW_REQUEST_RECEIVED);
        socket.off(GeneralEvent.USER_LOGGED_IN);
        socket.off(GeneralEvent.USER_LOGGED_OUT);
      };
    }
  }, [isAuthenticated, dispatch]);

  return isAuthenticated ? (
    <>
      <Stack direction="row">
        <Sidebar />
        <Outlet />
      </Stack>
    </>
  ) : (
    <Navigate to={PATH_APP.auth.login} replace />
  );
};

export default ProtectedDashboardLayout;
