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
  IconButton,
  Pagination,
  Stack,
  Tooltip,
} from "@mui/material";
import FriendSearch from "./FriendSearch";
import { useGetAllFriendsQuery } from "../../redux/features/friends/friends.api.slice";
import { Trash, Prohibit } from "phosphor-react";

export interface FriendProps {
  id: number;
  avatar: string;
  profile: string;
  nickname: string;
  friendSince: string;
}

const FriendsTable = () => {
  const { data } = useGetAllFriendsQuery();
  const friends = data?.data;

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
                  <TableCell align="center">Friend since</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {friends?.map(
                  ({
                    friend: {
                      id,
                      nickname,
                      profile: { avatar },
                    },
                    createdAt,
                  }) => (
                    <TableRow
                      key={id}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell padding="checkbox"></TableCell>

                      <TableCell component="th" scope="row">
                        <Avatar />
                      </TableCell>
                      <TableCell align="center">{nickname}</TableCell>
                      <TableCell align="center">
                        <Button>Profile</Button>
                      </TableCell>
                      <TableCell align="center">
                        {createdAt.toLocaleString()}
                      </TableCell>
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
};

export default FriendsTable;
