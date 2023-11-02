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
import { BaseFriendType } from "../../models/FriendsSchema";

export interface FriendProps {
  id: number;
  avatar: string;
  profile: string;
  nickname: string;
  friendSince: string;
}

const FriendsTable = () => {
  const { data, isLoading, isError } = useGetAllFriendsQuery();
  const [deleteFriend] = useDeleteFriendMutation();
  const [blockUser] = useBlockFriendMutation();

  const handleDeleteFriend = async (data: BaseFriendType) => {
    try {
      const res = await deleteFriend(data).unwrap();
      console.log({ res });
    } catch (error) {
      console.log(error);
    }
  };

  const handleBlock = async (data: BaseFriendType) => {
    try {
      console.log("entered in");

      const res = await blockUser(data).unwrap();
      console.log({ res });
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
    const friends = data.data;

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
                          <Avatar src={avatar} />
                        </TableCell>
                        <TableCell align="center">{nickname}</TableCell>
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
