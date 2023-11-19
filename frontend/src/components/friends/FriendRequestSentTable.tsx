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
import FriendSearch from "./FriendSearch";
import {
  useCancelRequestMutation,
  useGetAllSentFriendsRequestQuery,
} from "../../redux/features/friends/friends.api.slice";
import { X } from "phosphor-react";
import { BaseFriendType } from "../../models/FriendsSchema";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { useEffect } from "react";
import { FriendEvent } from "../../../../shared/socket.event";
import { SocketServerSucessResponse } from "../../services/type";
import { connectSocket, socket } from "../../utils/getSocket";
import { FriendSentRequestType } from "../../models/FriendRequestSchema";
import {
  addNewFriendRequestSent,
  deleteSentFriendRequest,
  setFriendRequestSent,
  updatePage,
} from "../../redux/features/friends/friends.slice";
import { RootState } from "../../redux/store";

const FriendRequestSentTable = () => {
  const { data, isLoading, isError } = useGetAllSentFriendsRequestQuery(
    undefined,
    { refetchOnMountOrArgChange: true }
  );
  const [cancelRequest] = useCancelRequestMutation();

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data && data.data) {
      dispatch(setFriendRequestSent(data.data));
      dispatch(updatePage("SENT"));
      connectSocket();
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
        <Stack spacing={2}>
          <FriendSearch placeholder="Search Friend Request" />
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
                              onClick={() =>
                                handleCancelRequest({ friendId: id })
                              }
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
        </Stack>
      </>
    );
  }
};

export default FriendRequestSentTable;
