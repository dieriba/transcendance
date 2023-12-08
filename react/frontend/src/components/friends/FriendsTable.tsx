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
import { useGetAllFriendsQuery } from "../../redux/features/friends/friends.api.slice";
import { Trash, Prohibit } from "phosphor-react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { useEffect, useState } from "react";
import { connectSocket, socket } from "../../utils/getSocket";
import { GeneralEvent } from "../../../shared/socket.event";
import { SocketServerSucessResponse } from "../../services/type";
import {
  setFriends,
  updatePage,
  updateUserStatus,
} from "../../redux/features/friends/friends.slice";
import { RootState } from "../../redux/store";
import BadgeAvatar from "../Badge/BadgeAvatar";
import UserProfile from "../Profile/UserProfile";
import { UserWithProfile } from "../../models/ChatContactSchema";
import { UserUpdateStatusType } from "../../models/login/UserSchema";
import DeleteFriendDialog from "./DeleteFriendDialog";
import BlockUserDialog from "./BlockFriendDialog";

export interface FriendProps {
  id: number;
  avatar: string;
  profile: string;
  nickname: string;
  friendSince: string;
}
type OpenType = {
  open: boolean;
  block: boolean;
  delete: boolean;
  id?: string;
};

const FriendsTable = () => {
  const { data, isLoading, isError } = useGetAllFriendsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [info, setInfo] = useState<OpenType>({
    open: false,
    block: false,
    delete: false,
  });

  const dispatch = useAppDispatch();

  const [user, setUser] = useState<UserWithProfile | undefined>(undefined);

  const handleSetUser = (
    data: Partial<UserWithProfile>,
    open: Partial<OpenType>
  ) => {
    setUser((prev) => ({ ...prev, ...(data as UserWithProfile) }));
    setInfo((prev) => ({ ...prev, ...open, id: data?.id }));
  };

  useEffect(() => {
    if (data && data.data) {
      dispatch(updatePage("FRIENDS"));
      dispatch(setFriends(data.data));
      connectSocket();

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
                            handleSetUser(
                              {
                                id,
                                nickname,
                                status,
                                profile: { avatar, firstname, lastname },
                                pong,
                              },
                              { open: true }
                            );
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
                              handleSetUser(
                                {
                                  id,
                                  nickname,
                                },
                                { delete: true }
                              );
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
                              handleSetUser(
                                {
                                  id,
                                  nickname,
                                },
                                { block: true }
                              );
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
          <BlockUserDialog
            open={info.block}
            handleClose={() => setInfo((prev) => ({ ...prev, block: false }))}
            friendId={info.id as string}
            nickname={nickname as string}
          />
        )}
        {info.delete && (
          <>
            <DeleteFriendDialog
              open={info.delete}
              handleClose={() =>
                setInfo((prev) => ({ ...prev, delete: false }))
              }
              friendId={info.id as string}
              nickname={nickname as string}
            />
          </>
        )}
      </>
    );
  }
};

export default FriendsTable;
