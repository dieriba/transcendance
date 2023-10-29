import { TablePagination } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { friends } from "../../data/data";
import { Avatar, Button, IconButton } from "@mui/material";
import { Trash } from "phosphor-react";

export interface FriendsProps {
  id: string;
  avatar: string;
  profle: string;
  nickname: string;
  friendSince: string;
}

interface CustomersTableProps {
  friends: FriendsProps[];
}

const CustomersTable = () => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox"></TableCell>
            <TableCell>Avatar</TableCell>
            <TableCell align="center">Nickname</TableCell>
            <TableCell align="center">Profile</TableCell>
            <TableCell align="center">Friend since</TableCell>
            <TableCell align="center">Delete</TableCell>
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
              <TableCell align="center">{friend.friendSince}</TableCell>
              <TableCell align="center">
                <IconButton>
                  <Trash />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/*<TablePagination
        component="div"
        count={6}
        onPageChange={() => {}}
        onRowsPerPageChange={() => {}}
        page={0}
        rowsPerPage={6}
          />*/}
    </TableContainer>
  );
};

export default CustomersTable;
