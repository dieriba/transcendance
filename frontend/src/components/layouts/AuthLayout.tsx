import { Container } from "@mui/material";
import { Navigate, Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { PATH_APP } from "../../routes/paths";
import { useEffect } from "react";
import { connectSocket, socket } from "../../utils/getSocket";
import { RootState } from "../../redux/store";
import { FriendEvent } from "../../../../shared/socket.event";
import { SocketServerSucessResponse } from "../../services/type";
import { FriendReceivedRequestType } from "../../models/FriendRequestSchema";
import { showSnackBar } from "../../redux/features/app_notify/app.slice";
import { BaseFriendType } from "../../models/FriendsSchema";
import { deleteReceivedFriendRequest } from "../../redux/features/friends/friends.slice";

const AuthLayout = () => {
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

      socket.on(
        FriendEvent.NEW_REQUEST_ACCEPTED,
        (data: SocketServerSucessResponse & { data: BaseFriendType }) => {
          dispatch(
            showSnackBar({ message: data.message, severity: "success" })
          );
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
        socket.off(FriendEvent.REQUEST_ACCEPTED);
        socket.off(FriendEvent.NEW_REQUEST_RECEIVED);
        socket.off(FriendEvent.REQUEST_ACCEPTED_FROM_RECIPIENT);
      };
    }
  }, [isAuthenticated, dispatch]);

  return isAuthenticated ? (
    <Navigate to={PATH_APP.dashboard.games} replace />
  ) : (
    <>
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          minHeight: "100vh",
        }}
        maxWidth="sm"
      >
        <Outlet />
      </Container>
    </>
  );
};

export default AuthLayout;
