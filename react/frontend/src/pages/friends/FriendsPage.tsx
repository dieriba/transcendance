import Box from "@mui/material/Box";
import { Container, Stack, Tabs, Tab, Button } from "@mui/material";
import { UserPlus } from "phosphor-react";
import FriendsTable from "../../components/friends/FriendsTable";
import { useEffect, useState } from "react";
import FriendRequestForm from "../../components/friends/FriendRequestForm";
import CustomTabPanel from "../../components/table-panel/CustomTablePanel";
import FriendRequestReceived from "../../components/friends/FriendRequestReceivedTable";
import FriendRequestSentTable from "../../components/friends/FriendRequestSentTable";
import BlockedUserTable from "../../components/friends/BlockedUserTable";
import { socket } from "../../utils/getSocket";
import { GeneralEvent } from "../../../shared/socket.event";
import { useAppDispatch } from "../../redux/hooks";
import {
  setNewUserAvatarSrc,
  updateFriendInfo,
} from "../../redux/features/friends/friends.slice";
import { UpdatedAvatarRes, UserUpdated } from "../../models/login/UserSchema";
import { a11yProps } from "../../utils/allyProps";

const FriendsPage = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [value, setValue] = useState(1);
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!socket) return;

    socket.on(
      GeneralEvent.USER_CHANGED_USERNAME,
      (data: { data: UserUpdated }) => {
        dispatch(updateFriendInfo(data.data));
      }
    );

    socket.on(
      GeneralEvent.USER_CHANGED_AVATAR,
      (data: { data: UpdatedAvatarRes }) => {
        dispatch(setNewUserAvatarSrc(data.data));
      }
    );
    return () => {
      socket.off(GeneralEvent.USER_CHANGED_USERNAME);
      socket.off(GeneralEvent.USER_CHANGED_AVATAR);
    };
  }, [dispatch]);

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 4,
          height: "100vh",
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Button
                endIcon={<UserPlus />}
                onClick={() => setOpenCreate(true)}
              >
                Add New Friend
              </Button>
            </Stack>
            <Tabs
              variant="fullWidth"
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab label="Received friends request" {...a11yProps(0)} />
              <Tab label="Friends" {...a11yProps(1)} />
              <Tab label="Sent friends request" {...a11yProps(2)} />
              <Tab label="Blocked users" {...a11yProps(3)} />
            </Tabs>
            <CustomTabPanel value={value} index={0}>
              <FriendRequestReceived />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <FriendsTable />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
              <FriendRequestSentTable />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={3}>
              <BlockedUserTable />
            </CustomTabPanel>
          </Stack>
        </Container>
      </Box>
      <FriendRequestForm
        open={openCreate}
        handleClose={() => setOpenCreate(false)}
      />
    </>
  );
};
export default FriendsPage;
