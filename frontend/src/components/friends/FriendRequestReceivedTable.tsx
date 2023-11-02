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
  useAcceptFriendRequestMutation,
  useBlockFriendMutation,
  useCancelRequestMutation,
  useGetAllReceivedFriendsRequestQuery,
} from "../../redux/features/friends/friends.api.slice";

import { BaseFriendType } from "../../models/FriendsSchema";
import { X, Check, Prohibit } from "phosphor-react";
import CustomDialog from "../Dialog/CustomDialog";
import { useState } from "react";

const FriendRequestReceived = () => {
  const { data, isLoading, isError } = useGetAllReceivedFriendsRequestQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
    }
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
      const res = await cancelRequest(friend).unwrap();
    } catch (error) {
      console.log(error);
    }
  };

  const handleBlockUser = async (friend: BaseFriendType) => {
    try {
      const res = await blockUser(friend).unwrap();
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
    console.log(data);
    
    const friendRequest = data.data;

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
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {friendRequest?.map(({ sender: { id, nickname } }) => (
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
