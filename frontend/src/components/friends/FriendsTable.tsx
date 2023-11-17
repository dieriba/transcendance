import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Avatar,
  Button,
  CircularProgress,
  IconButton,
  Pagination,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import FriendSearch from "./FriendSearch";
import {
  useBlockFriendMutation,
  useDeleteFriendMutation,
  useGetAllFriendsQuery,
} from "../../redux/features/friends/friends.api.slice";
import { Trash, Prohibit } from "phosphor-react";
import { BaseFriendType, FriendType } from "../../models/FriendsSchema";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { useEffect } from "react";
import { connectSocket, socket } from "../../utils/getSocket";
import { FriendEvent, GeneralEvent } from "../../../../shared/socket.event";
import { SocketServerSucessResponse } from "../../services/type";
import {
  addFriend,
  deleteFriend,
  setFriends,
  setOfflineFriend,
  setOnlineFriend,
  updatePage,
} from "../../redux/features/friends/friends.slice";
import { RootState } from "../../redux/store";
import { deleteChatroom } from "../../redux/features/chat/chat.slice";
import BadgeAvatar from "../Badge/BadgeAvatar";

export interface FriendProps {
  id: number;
  avatar: string;
  profile: string;
  nickname: string;
  friendSince: string;
}

const FriendsTable = () => {
  const { data, isLoading, isError } = useGetAllFriendsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data && data.data) {
      dispatch(updatePage("FRIENDS"));
      dispatch(setFriends(data.data));
      connectSocket();
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
        GeneralEvent.USER_LOGGED_IN,
        (data: SocketServerSucessResponse & { data: BaseFriendType }) => {
          dispatch(setOnlineFriend(data.data));
        }
      );

      socket.on(
        GeneralEvent.USER_LOGGED_OUT,
        (data: SocketServerSucessResponse & { data: BaseFriendType }) => {
          dispatch(setOfflineFriend(data.data));
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
        }
      );

      return () => {
        socket.off(FriendEvent.NEW_FRIEND);
        socket.off(FriendEvent.DELETE_FRIEND);
        socket.off(GeneralEvent.USER_LOGGED_IN);
        socket.off(GeneralEvent.USER_LOGGED_OUT);
      };
    }
  }, [data, dispatch]);

  const friends = useAppSelector((state: RootState) => state.friends.friends);
  const chatroomId = useAppSelector(
    (state: RootState) => state.groups.currentGroupChatroomId
  );
  const [deleteFriendMutation] = useDeleteFriendMutation();
  const [blockUser] = useBlockFriendMutation();

  const handleDeleteFriend = async (data: BaseFriendType) => {
    try {
      await deleteFriendMutation(data).unwrap();
      dispatch(deleteChatroom(chatroomId));
    } catch (error) {
      console.log(error);
    }
  };

  const handleBlock = async (data: BaseFriendType) => {
    try {
      await blockUser(data).unwrap();
    } catch (error) {
      console.log(error);
    }
  };
  if (isLoading) {
    return (
      <Stack alignItems="center" height="100%" pt={25} justifyContent="center">
        <CircularProgress size={100} />
      </Stack>
    );
  } else if (isError || !data) {
    return (
      <Stack alignItems="center" height="100%" pt={25} justifyContent="center">
        <Typography>An error has occured</Typography>
      </Stack>
    );
  } else {
    return (
      <>
        <Stack spacing={2}>
          <FriendSearch placeholder="Search Friend" />
          <Stack spacing={3} alignItems="center">
            <TableContainer
              sx={{ height: "500px", overflow: "scroll" }}
              component={Paper}
            >
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox"></TableCell>
                    <TableCell>Avatar</TableCell>
                    <TableCell align="center">Nickname</TableCell>
                    <TableCell align="center">Profile</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {friends.map(
                    ({
                      friend: {
                        id,
                        nickname,
                        status,
                        profile: { avatar },
                      },
                    }) => (
                      <TableRow
                        key={id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell padding="checkbox"></TableCell>

                        <TableCell component="th" scope="row">
                          {status === "ONLINE" ? (
                            <BadgeAvatar>
                              <Avatar
                                sx={{ width: "50px", height: "50px" }}
                                src={avatar ? avatar : undefined}
                              />
                            </BadgeAvatar>
                          ) : (
                            <Avatar src={avatar ? avatar : undefined} />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="subtitle1">
                            {nickname}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Button>Profile</Button>
                        </TableCell>
                        <TableCell align="center">
                          <Stack
                            direction="row"
                            justifyContent="center"
                            spacing={2}
                          >
                            <Tooltip
                              onClick={() => {
                                handleDeleteFriend({ friendId: id });
                              }}
                              placement="top"
                              title="delete"
                            >
                              <IconButton>
                                <Trash />
                              </IconButton>
                            </Tooltip>
                            <Tooltip
                              onClick={() => {
                                handleBlock({ friendId: id });
                              }}
                              placement="top"
                              title="Block"
                            >
                              <IconButton>
                                <Prohibit />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Pagination
              sx={{ justifySelf: "flex-end" }}
              count={10}
              color="primary"
            />
          </Stack>
        </Stack>
      </>
    );
  }
};

export default FriendsTable;
