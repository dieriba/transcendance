import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { friends } from "../../data/data";
import {
  Avatar,
  Button,
  IconButton,
  Pagination,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Prohibit, Trash } from "phosphor-react";
import FriendSearch from "./FriendSearch";
import { getFriendsSocket } from "../../utils/getScoket";

export interface FriendProps {
  id: number;
  avatar: string;
  profile: string;
  nickname: string;
  friendSince: string;
}

interface FriendsProps {
  friends: FriendsProps[];
}

const FriendsTable = () => {
  return (
    <>
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
                <TableCell align="center">Friend since</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {friends.length == 0 ? (
                <Stack>
                  <Typography></Typography>
                </Stack>
              ) : (
                friends.map((friend) => (
                  <TableRow
                    key={friend.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell padding="checkbox"></TableCell>

                    <TableCell component="th" scope="row">
                      <Avatar />
                    </TableCell>
                    <TableCell align="center">{friend.nickname}</TableCell>
                    <TableCell align="center">
                      <Button>Profile</Button>
                    </TableCell>
                    <TableCell align="center">{friend.friendSince}</TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        justifyContent="center"
                        spacing={2}
                      >
                        <Tooltip placement="top" title="delete">
                          <IconButton>
                            <Trash />
                          </IconButton>
                        </Tooltip>
                        <Tooltip placement="top" title="Block">
                          <IconButton>
                            <Prohibit />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
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
    </>
  );
};

export default FriendsTable;
