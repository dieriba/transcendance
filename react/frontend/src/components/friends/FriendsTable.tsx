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
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  useBlockFriendMutation,
  useDeleteFriendMutation,
  useGetAllFriendsQuery,
} from "../../redux/features/friends/friends.api.slice";
import { Trash, Prohibit } from "phosphor-react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { useEffect, useState } from "react";
import { socket } from "../../utils/getSocket";
import { GeneralEvent } from "../../../shared/socket.event";
import {
  BaseFriendTypeWithChatroom,
  SocketServerSucessResponse,
} from "../../services/type";
import {
  setFriends,
  updatePage,
  updateUserStatus,
} from "../../redux/features/friends/friends.slice";
import { RootState } from "../../redux/store";
import BadgeAvatar from "../Badge/BadgeAvatar";
import UserProfile from "../Profile/UserProfile";
import CustomDialog from "../Dialog/CustomDialog";
import { UserWithProfile } from "../../models/ChatContactSchema";
import { UserUpdateStatusType } from "../../models/login/UserSchema";

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

  const [deleteFriend] = useDeleteFriendMutation();
  const [blockUser] = useBlockFriendMutation();

  const [info, setInfo] = useState<{
    open: boolean;
    block: boolean;
    delete: boolean;
    id?: string;
  }>({ open: false, block: false, delete: false });

  const dispatch = useAppDispatch();

  const [user, setUser] = useState<UserWithProfile | undefined>(undefined);

  const handleSetUser = (data: UserWithProfile) => {
    setUser(data);
    setInfo((prev) => ({ ...prev, open: true }));
  };

  const handleDeleteFriend = async (data: BaseFriendTypeWithChatroom) => {
    try {
      const { friendId } = data;

      await deleteFriend({ friendId }).unwrap();
      setInfo((prev) => ({ ...prev, open: false }));
    } catch (error) {
      setInfo((prev) => ({ ...prev, open: false }));
      console.log(error);
    }
  };

  const handleBlockUser = async (data: BaseFriendTypeWithChatroom) => {
    try {
      const { friendId } = data;

      await blockUser({ friendId }).unwrap();

      setInfo((prev) => ({ ...prev, open: false }));
    } catch (error) {
      console.log(error);
      setInfo((prev) => ({ ...prev, open: false }));
    }
  };

  useEffect(() => {
    if (data && data.data) {
      dispatch(updatePage("FRIENDS"));
      dispatch(setFriends(data.data));
      if (!socket) return;

      socket.on(
        GeneralEvent.USER_UPDATE_STATUS,
        (data: SocketServerSucessResponse & { data: UserUpdateStatusType }) => {
          dispatch(updateUserStatus(data.data));
        }
      );

      return () => {
        socket.off(GeneralEvent.USER_UPDATE_STATUS);
      };
    }
  }, [data, dispatch]);

  const friends = useAppSelector((state: RootState) => state.friends.friends);

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
    const nickname = user?.nickname;
    return (
      <>
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
                      profile: { avatar, lastname, firstname },
                      pong,
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
                          <Avatar
                            sx={{ width: "50px", height: "50px" }}
                            src={avatar ? avatar : undefined}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="subtitle1">{nickname}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="inherit"
                          onClick={() => {
                            handleSetUser({
                              id,
                              nickname,
                              status,
                              profile: { avatar, firstname, lastname },
                              pong,
                            });
                          }}
                        >
                          Profile
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          justifyContent="center"
                          spacing={2}
                        >
                          <Tooltip
                            onClick={() => {
                              setInfo((prev) => ({
                                ...prev,
                                delete: true,
                                id,
                              }));
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
                              setInfo((prev) => ({
                                ...prev,
                                block: true,
                                id,
                              }));
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
        </Stack>
        {info.open && (
          <UserProfile
            user={user as UserWithProfile}
            open={info.open}
            handleClose={() => setInfo((prev) => ({ ...prev, open: false }))}
          />
        )}
        {info.block && (
          <CustomDialog
            handleOnClick={handleBlockUser}
            open={info.block}
            handleClose={() => setInfo((prev) => ({ ...prev, block: false }))}
            title={`Block ${nickname} ?`}
            content={`Do you really want to block ${nickname} ?`}
            friendId={info.id as string}
          />
        )}
        {info.delete && (
          <CustomDialog
            handleOnClick={handleDeleteFriend}
            open={info.delete}
            handleClose={() => setInfo((prev) => ({ ...prev, delete: false }))}
            title={`Delete ${nickname}`}
            content={`Do you really want to delete ${nickname} ?`}
            friendId={info.id as string}
          />
        )}
      </>
    );
  }
};

export default FriendsTable;
