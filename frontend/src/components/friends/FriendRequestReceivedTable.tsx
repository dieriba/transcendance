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
} from "@mui/material";
import { Check, X } from "phosphor-react";
import FriendSearch from "./FriendSearch";

const FriendRequestReceived = () => {
  return (
    <>
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
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {friends.map((friend) => (
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
                  <TableCell align="center">
                    <Stack direction="row" justifyContent="center" spacing={2}>
                      <Tooltip title="cancel" placement="top">
                        <IconButton>
                          <X />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="accept" placement="top">
                        <IconButton>
                          <Check />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
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

export default FriendRequestReceived;
