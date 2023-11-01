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
import { Check, X } from "phosphor-react";
import FriendSearch from "./FriendSearch";
import {
  useCancelReceivedRequestMutation,
  useGetAllReceivedFriendsRequestQuery,
} from "../../redux/features/friends/friends.api.slice";
import CustomNotificationBar from "../snackbar/customNotificationBar";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { showSnackBar } from "../../redux/features/app_notify/app.slice";
import { useEffect } from "react";
import { BaseFriendType } from "../../models/FriendsSchema";
import { RootState } from "../../redux/store";

const FriendRequestReceived = () => {
  const { data, isLoading, isError, isSuccess } =
    useGetAllReceivedFriendsRequestQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });
  const { open, severity, message } = useAppSelector(
    (state: RootState) => state.appNotify
  );
  const dispatch = useAppDispatch();
  const [cancelRequest] = useCancelReceivedRequestMutation();

  const onClick = async (friend: BaseFriendType) => {
    try {
      await cancelRequest(friend).unwrap();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (data) {
      dispatch(showSnackBar({ message: data.message, severity: "success" }));
    }
  }, [data, dispatch, isSuccess]);

  if (isLoading) {
    return (
      <Stack alignItems="center" height="100%" pt={25} justifyContent="center">
        <CircularProgress size={100} />
      </Stack>
    );
  } else if (isError) {
    return (
      <Stack alignItems="center" height="100%" pt={25} justifyContent="center">
        <Typography>An error has occured</Typography>
      </Stack>
    );
  } else {
    const friendRequest = data?.data;

    return (
      <>
        <CustomNotificationBar
          open={open}
          severity={severity}
          message={message}
        />
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
                        <Tooltip title="cancel" placement="top">
                          <IconButton onClick={() => onClick({ friendId: id })}>
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
  }
};

export default FriendRequestReceived;
