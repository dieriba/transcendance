import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import { Stack, useMediaQuery } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { PATH_APP } from "../../routes/paths";
import { useEffect } from "react";
import { connectSocket, socket } from "../../utils/getSocket";
import { FriendEvent, GeneralEvent } from "../../../../shared/socket.event";
import { SocketServerSucessResponse } from "../../services/type";
import { FriendReceivedRequestType } from "../../models/FriendRequestSchema";
import { showSnackBar } from "../../redux/features/app/app.slice";
import { BaseFriendType, FriendType } from "../../models/FriendsSchema";
import {
  setOfflineUser,
  setOnlineUser,
} from "../../redux/features/chat/chat.slice";
import { RootState } from "../../redux/store";
import {
  addFriend,
  deleteFriend,
  deleteReceivedFriendRequest,
} from "../../redux/features/friends/friends.slice";
import { useTheme } from "@mui/material/styles";
import MobileSidebar from "../sidebar/MobileSidebar";

const ProtectedDashboardLayout = () => {
  const isAuthenticated = useAppSelector(
    (state: RootState) => state.user.access_token
  );
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

      socket.on(GeneralEvent.TOKEN_NOT_VALID, (data) => {
        console.log({ data });
      });

      socket.on(
        FriendEvent.DELETE_FRIEND,
        (
          data: SocketServerSucessResponse & {
            data: BaseFriendType;
          }
        ) => {
          dispatch(deleteFriend(data.data));
        }
      );

      socket.on(
        FriendEvent.NEW_FRIEND,
        (
          data: SocketServerSucessResponse & {
            data: FriendType;
          }
        ) => {
          dispatch(addFriend(data.data));
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
          dispatch(deleteReceivedFriendRequest(data.data));
        }
      );

      return () => {
        socket.off(GeneralEvent.TOKEN_NOT_VALID);
        socket.off(FriendEvent.DELETE_FRIEND);
        socket.off(FriendEvent.NEW_FRIEND);
        socket.off(GeneralEvent.USER_LOGGED_IN);
        socket.off(GeneralEvent.USER_LOGGED_OUT);
        socket.off(FriendEvent.REQUEST_ACCEPTED_FROM_RECIPIENT);
        socket.off(FriendEvent.NEW_REQUEST_RECEIVED);
        socket.off(FriendEvent.NEW_REQUEST_ACCEPTED);
      };
    }
  }, [isAuthenticated, dispatch]);

  const theme = useTheme();
  const onlyMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  return isAuthenticated ? (
    <>
      <Stack
        width={"100%"}
        height={"100vh"}
        direction={onlyMediumScreen ? "column" : "row"}
      >
        {onlyMediumScreen ? <MobileSidebar /> : <Sidebar />}
        <Outlet />
      </Stack>
    </>
  ) : (
    <Navigate to={PATH_APP.auth.login} replace />
  );
};

export default ProtectedDashboardLayout;
