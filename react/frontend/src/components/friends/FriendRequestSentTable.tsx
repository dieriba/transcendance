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
  useCancelRequestMutation,
  useGetAllSentFriendsRequestQuery,
} from "../../redux/features/friends/friends.api.slice";
import { X } from "phosphor-react";
import { BaseFriendType } from "../../models/FriendsSchema";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { useEffect, useState } from "react";
import { FriendEvent } from "../../../shared/socket.event";
import { SocketServerSucessResponse } from "../../services/type";
import { socket } from "../../utils/getSocket";
import { FriendSentRequestType } from "../../models/FriendRequestSchema";
import {
  addNewFriendRequestSent,
  deleteSentFriendRequest,
  setFriendRequestSent,
  updatePage,
} from "../../redux/features/friends/friends.slice";
import { RootState } from "../../redux/store";
import CustomDialog from "../Dialog/CustomDialog";

const FriendRequestSentTable = () => {
  const { data, isLoading, isError } = useGetAllSentFriendsRequestQuery(
    undefined,
    { refetchOnMountOrArgChange: true }
  );
  const [cancelRequest] = useCancelRequestMutation();

  const dispatch = useAppDispatch();
  const [info, setOpen] = useState<{
    cancel: boolean;
    id: string;
    nickname: string;
  }>({
    cancel: false,
    id: "",
    nickname: "",
  });
  useEffect(() => {
    if (data && data.data) {
      dispatch(setFriendRequestSent(data.data));
      dispatch(updatePage("SENT"));
      if (!socket) return;

      socket.on(
        FriendEvent.NEW_REQUEST_SENT,
        (
          data: SocketServerSucessResponse & {
            data: FriendSentRequestType;
          }
        ) => {
          dispatch(addNewFriendRequestSent(data.data));
        }
      );

      socket.on(
        FriendEvent.CANCEL_REQUEST,
        (
          data: SocketServerSucessResponse & {
            data: BaseFriendType;
          }
        ) => {
          dispatch(deleteSentFriendRequest(data.data));
        }
      );

      return () => {
        socket.off(FriendEvent.NEW_REQUEST_SENT);
        socket.off(FriendEvent.CANCEL_REQUEST);
      };
    }
  }, [data, dispatch]);

  const friendRequest = useAppSelector(
    (state: RootState) => state.friends.sentFriendsRequest
  );

  const handleCancelRequest = async (friend: BaseFriendType) => {
    try {
      await cancelRequest(friend).unwrap();
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
                  <TableCell align="center">Cancel</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {friendRequest?.map(
                  ({
                    recipient: {
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
                            onClick={() => {
                              setOpen((prev) => ({
                                ...prev,
                                nickname,
                                cancel: true,
                                id,
                              }));
                            }}
                            placement="top"
                            title="cancel"
                          >
                            <IconButton>
                              <X />
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
        {info.cancel && (
          <>
            <CustomDialog
              handleOnClick={handleCancelRequest}
              open={info.cancel}
              handleClose={() =>
                setOpen((prev) => ({ ...prev, cancel: false }))
              }
              title={`Cancel Friend request of ${info.nickname}`}
              content={`Do you really want to remove friend request to ${info.nickname}?`}
              friendId={info.id}
            />
          </>
        )}
      </>
    );
  }
};

export default FriendRequestSentTable;
