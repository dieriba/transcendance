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
  useGetAllBlockedUserQuery,
  useUnblockFriendMutation,
} from "../../redux/features/friends/friends.api.slice";
import { X } from "phosphor-react";
import { BaseFriendType } from "../../models/FriendsSchema";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { socket } from "../../utils/getSocket";
import { FriendEvent } from "../../../../shared/socket.event";
import { SocketServerSucessResponse } from "../../services/type";
import {
  removeBlockedUser,
  setBlockedUser,
  updatePage,
} from "../../redux/features/friends/friends.slice";
import { RootState } from "../../redux/store";

const BlockedUserTable = () => {
  const { data, isLoading, isError } = useGetAllBlockedUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [unblockFriend, unblockAction] = useUnblockFriendMutation();

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data && data.data) {
      dispatch(setBlockedUser(data.data));
      dispatch(updatePage("BLOCKED"));
      socket.on(
        FriendEvent.UNBLOCK_FRIEND,
        (
          data: SocketServerSucessResponse & {
            data: BaseFriendType;
          }
        ) => {
          dispatch(removeBlockedUser(data.data));
        }
      );
      return () => {
        socket.off(FriendEvent.UNBLOCK_FRIEND);
      };
    }
  }, [data, dispatch]);

  const blockedUser = useAppSelector(
    (state: RootState) => state.friends.blockedUser
  );

  const handleUnblockFriend = async (friend: BaseFriendType) => {
    try {
      if (!unblockAction.isLoading) {
        await unblockFriend(friend).unwrap();
      }
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
          <FriendSearch placeholder="Blocked User" />
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
                              handleUnblockFriend({ friendId: id })
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
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Stack>
      </>
    );
  }
};

export default BlockedUserTable;
