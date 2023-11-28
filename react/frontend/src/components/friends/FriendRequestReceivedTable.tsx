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
  useAcceptFriendRequestMutation,
  useBlockFriendMutation,
  useCancelRequestMutation,
  useGetAllReceivedFriendsRequestQuery,
} from "../../redux/features/friends/friends.api.slice";

import { BaseFriendType } from "../../models/FriendsSchema";
import { X, Check, Prohibit } from "phosphor-react";
import CustomDialog from "../Dialog/CustomDialog";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  addNewFriendRequestReceived,
  deleteReceivedFriendRequest,
  setFriendRequestReceived,
  updatePage,
} from "../../redux/features/friends/friends.slice";
import { FriendEvent } from "../../../../shared/socket.event";
import { SocketServerSucessResponse } from "../../services/type";
import { connectSocket, socket } from "../../utils/getSocket";
import { FriendReceivedRequestType } from "../../models/FriendRequestSchema";
import { showSnackBar } from "../../redux/features/app/app.slice";
import { RootState } from "../../redux/store";

const FriendRequestReceived = () => {
  const { data, isLoading, isError } = useGetAllReceivedFriendsRequestQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data && data.data) {
      dispatch(setFriendRequestReceived(data.data));
      dispatch(updatePage("RECEIVED"));
      connectSocket();
      socket.on(
        FriendEvent.ADD_NEW_REQUEST,
        (
          data: SocketServerSucessResponse & {
            data: FriendReceivedRequestType;
          }
        ) => {
          dispatch(addNewFriendRequestReceived(data.data));
          dispatch(
            showSnackBar({ message: data.message, severity: "success" })
          );
        }
      );

      socket.on(
        FriendEvent.CANCEL_REQUEST,
        (
          data: SocketServerSucessResponse & {
            data: BaseFriendType;
          }
        ) => {
          dispatch(deleteReceivedFriendRequest(data.data));
        }
      );

      return () => {
        socket.off(FriendEvent.ADD_NEW_REQUEST);
        socket.off(FriendEvent.CANCEL_REQUEST);
      };
    }
  }, [data, dispatch]);

  const friendRequest = useAppSelector(
    (state: RootState) => state.friends.receivedFriendsRequest
  );

  const [open, setOpen] = useState<{
    block: boolean;
    cancel: boolean;
    friendId: string;
  }>({ block: false, cancel: false, friendId: "" });

  const [blockUser] = useBlockFriendMutation();
  const [cancelRequest] = useCancelRequestMutation();
  const [acceptRequest] = useAcceptFriendRequestMutation();
  const cancelFriendRequest = async (friend: BaseFriendType) => {
    try {
      await cancelRequest(friend).unwrap();
    } catch (error) {
      console.log(error);
    }
  };

  const handleBlockUser = async (friend: BaseFriendType) => {
    try {
      await blockUser(friend).unwrap();
    } catch (error) {
      console.log(error);
    }
  };

  const acceptFriendRequest = async (friend: BaseFriendType) => {
    try {
      await acceptRequest(friend).unwrap();
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
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {friendRequest?.map(
                  ({
                    sender: {
                      id,
                      nickname,
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
                          <Tooltip
                            onClick={() =>
                              setOpen((prev) => ({
                                ...prev,
                                block: true,
                                friendId: id,
                              }))
                            }
                            placement="top"
                            title="block"
                          >
                            <IconButton>
                              <Prohibit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip
                            onClick={() =>
                              setOpen((prev) => ({
                                ...prev,
                                cancel: true,
                                friendId: id,
                              }))
                            }
                            placement="top"
                            title="cancel"
                          >
                            <IconButton>
                              <X />
                            </IconButton>
                          </Tooltip>
                          <Tooltip placement="top" title="accept">
                            <IconButton
                              onClick={() =>
                                acceptFriendRequest({ friendId: id })
                              }
                            >
                              <Check />
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

        <CustomDialog
          handleOnClick={handleBlockUser}
          open={open.block}
          handleClose={() => setOpen((prev) => ({ ...prev, block: false }))}
          title="Block User ?"
          content="Do you really want to block that user ?"
          friendId={open.friendId}
        />
        <CustomDialog
          handleOnClick={cancelFriendRequest}
          open={open.cancel}
          handleClose={() => setOpen((prev) => ({ ...prev, cancel: false }))}
          title="Cancel friend request ?"
          content="Do you really want to cancel that friend request ?"
          friendId={open.friendId}
        />
      </>
    );
  }
};

export default FriendRequestReceived;
