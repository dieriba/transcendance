import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import { Stack, useMediaQuery } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { PATH_APP } from "../../routes/paths";
import { useEffect } from "react";
import { connectSocket, socket } from "../../utils/getSocket";
import {
  ChatEventGroup,
  FriendEvent,
  GeneralEvent,
  PongEvent,
} from "../../../shared/socket.event";
import { SocketServerSucessResponse } from "../../services/type";
import { FriendReceivedRequestType } from "../../models/FriendRequestSchema";
import {
  setGameInvitation,
  showSnackBar,
} from "../../redux/features/app/app.slice";
import { BaseFriendType, FriendType } from "../../models/FriendsSchema";
import { RootState } from "../../redux/store";
import {
  addFriend,
  deleteFriend,
  deleteReceivedFriendRequest,
} from "../../redux/features/friends/friends.slice";
import { useTheme } from "@mui/material/styles";
import MobileSidebar from "../sidebar/MobileSidebar";
import { ChatroomGroupType } from "../../models/groupChat";
import { addGroupInvitation } from "../../redux/features/groups/group.slice";
import { setGameData } from "../../redux/features/pong/pong.slice";
import { apiSlice } from "../../redux/api/apiSlice";
import { LOGOUT } from "../../redux/type";
import { deleteChatroomById } from "../../redux/features/chat/chat.slice";
import { StartGameInfo } from "../../../shared/types";
import { Basetype } from "../../models/BaseType";

const ProtectedDashboardLayout = () => {
  const isAuthenticated = useAppSelector(
    (state: RootState) => state.user.access_token
  );
  const gameData = useAppSelector((state: RootState) => state.pong.gameData);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();

      socket.on(GeneralEvent.DISCONNECT_ME, () => {
        dispatch(apiSlice.util.resetApiState());
        dispatch({ type: LOGOUT });
        // eslint-disable-next-line no-self-assign
        window.location = window.location;
      });

      socket.on(
        PongEvent.END_GAME,
        (data: SocketServerSucessResponse & { data: { message: string } }) => {
          dispatch(setGameData(undefined));

          if (location.pathname === PATH_APP.dashboard.pong)
            navigate(PATH_APP.dashboard.games, { replace: true });
          dispatch(
            showSnackBar({
              message: data.data.message,
              severity: data.severity,
            })
          );
        }
      );

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
        ChatEventGroup.RECEIVED_GROUP_INVITATION,
        (data: SocketServerSucessResponse & { data: ChatroomGroupType }) => {
          dispatch(addGroupInvitation({ chatroom: data.data }));
          dispatch(
            showSnackBar({ message: data.message, severity: data.severity })
          );
        }
      );

      socket.on(
        GeneralEvent.DESERTER,
        (data: SocketServerSucessResponse & { data: unknown }) => {
          dispatch(setGameData(undefined));
          dispatch(
            showSnackBar({ message: data.message, severity: data.severity })
          );
        }
      );

      socket.on(
        FriendEvent.DELETE_FRIEND,
        (
          data: SocketServerSucessResponse & {
            data: BaseFriendType;
          }
        ) => {
          dispatch(deleteFriend(data.data));
          dispatch(deleteChatroomById(data.data.friendId));
          dispatch(showSnackBar({ message: data.message }));
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
        FriendEvent.REQUEST_ACCEPTED_FROM_RECIPIENT,
        (data: SocketServerSucessResponse & { data: BaseFriendType }) => {
          dispatch(
            showSnackBar({ message: data.message, severity: "success" })
          );
          dispatch(deleteReceivedFriendRequest(data.data));
        }
      );

      socket.on(
        PongEvent.RECEIVE_GAME_INVITATION,
        (data: SocketServerSucessResponse & { data: Basetype }) => {
          dispatch(
            setGameInvitation({ message: data.message, id: data.data.id })
          );
        }
      );

      socket.on(
        PongEvent.LETS_PLAY,
        (data: SocketServerSucessResponse & { data: StartGameInfo }) => {
          dispatch(setGameData(data.data));
          navigate(PATH_APP.dashboard.pong);
        }
      );

      socket.on(
        PongEvent.USER_DECLINED_INVITATION,
        (data: SocketServerSucessResponse) => {
          dispatch(showSnackBar(data));
        }
      );

      return () => {
        socket.off(PongEvent.END_GAME);
        socket.off(GeneralEvent.DESERTER);
        socket.off(GeneralEvent.DISCONNECT_ME);
        socket.off(ChatEventGroup.RECEIVED_GROUP_INVITATION);
        socket.off(FriendEvent.DELETE_FRIEND);
        socket.off(FriendEvent.NEW_FRIEND);
        socket.off(FriendEvent.REQUEST_ACCEPTED_FROM_RECIPIENT);
        socket.off(FriendEvent.NEW_REQUEST_RECEIVED);
        socket.off(FriendEvent.NEW_REQUEST_ACCEPTED);
        socket.off(PongEvent.LETS_PLAY);
        socket.off(PongEvent.USER_DECLINED_INVITATION);
        socket.off(PongEvent.RECEIVE_GAME_INVITATION);
      };
    }
  }, [navigate, isAuthenticated, dispatch, location.pathname]);

  const theme = useTheme();
  const onlyMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  if (
    isAuthenticated &&
    !gameData &&
    location.pathname === PATH_APP.dashboard.pong
  )
    return <Navigate to={PATH_APP.dashboard.games} replace />;

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
