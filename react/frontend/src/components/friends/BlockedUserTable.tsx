import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Avatar,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  useGetAllBlockedUserQuery,
  useUnblockFriendMutation,
} from "../../redux/features/friends/friends.api.slice";
import { X } from "phosphor-react";
import { BaseFriendType } from "../../models/FriendsSchema";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { connectSocket, socket } from "../../utils/getSocket";
import { GeneralEvent } from "../../../shared/socket.event";
import { SocketServerSucessResponse } from "../../services/type";
import {
  addBlockedUser,
  removeBlockedUser,
  setBlockedUser,
  updatePage,
} from "../../redux/features/friends/friends.slice";
import { RootState } from "../../redux/store";
import CustomDialog from "../Dialog/CustomDialog";
import { BaseUserInfoType } from "../../models/login/UserSchema";

const BlockedUserTable = () => {
  const { data, isLoading, isError } = useGetAllBlockedUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [unblockFriend, unblockAction] = useUnblockFriendMutation();
  const [info, setOpen] = useState<{
    unblock: boolean;
    id: string;
    nickname: string;
  }>({
    unblock: false,
    id: "",
    nickname: "",
  });
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data && data.data) {
      dispatch(setBlockedUser(data.data));
      dispatch(updatePage("BLOCKED"));
      connectSocket();

      socket.on(
        GeneralEvent.NEW_BLOCKED_USER,
        (data: SocketServerSucessResponse & { data: BaseUserInfoType }) => {
          dispatch(addBlockedUser(data.data));
        }
      );

      socket.on(
        GeneralEvent.REMOVE_BLOCKED_USER,
        (
          data: SocketServerSucessResponse & {
            data: BaseUserInfoType;
          }
        ) => {
          dispatch(removeBlockedUser(data.data.id));
        }
      );
      return () => {
        socket.off(GeneralEvent.NEW_BLOCKED_USER);
        socket.off(GeneralEvent.REMOVE_BLOCKED_USER);
      };
    }
  }, [data, dispatch]);

  const blockedUser = useAppSelector(
    (state: RootState) => state.friends.blockedUser
  );

  const handleUnblockFriend = async (friend: BaseFriendType) => {
    try {
      await unblockFriend(friend).unwrap();
    } catch (error) {
      /** */
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
                  <TableCell align="center">Cancel</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {blockedUser.map(({ id, nickname, profile: { avatar } }) => (
                  <TableRow
                    key={id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell padding="checkbox"></TableCell>
                    <TableCell component="th" scope="row">
                      <Avatar src={avatar ? avatar : undefined} />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="subtitle1">{nickname}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        justifyContent="center"
                        spacing={2}
                      >
                        <Tooltip placement="top" title="cancel">
                          <IconButton
                            onClick={() => {
                              setOpen((prev) => ({
                                ...prev,
                                nickname,
                                unblock: true,
                                id,
                              }));
                            }}
                            disabled={unblockAction.isLoading}
                          >
                            <X />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
        {info.unblock && (
          <>
            <CustomDialog
              handleOnClick={handleUnblockFriend}
              open={info.unblock}
              handleClose={() =>
                setOpen((prev) => ({ ...prev, unblock: false }))
              }
              title={`Unblock ${info.nickname}`}
              content={`Do you really want to unblock ${info.nickname}?`}
              friendId={info.id}
            />
          </>
        )}
      </>
    );
  }
};

export default BlockedUserTable;
