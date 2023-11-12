import {
  Box,
  Stack,
  Typography,
  IconButton,
  Divider,
  Button,
  Switch,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { X, Bell, Trash } from "phosphor-react";
import { closeGroupSidebar } from "../../../redux/features/sidebar.slices";
import { useTheme } from "@mui/material/styles";
import { useAppDispatch } from "../../../redux/hooks";
import DialogI from "../../Dialog/DialogI";
import { useEffect, useState } from "react";
import { connectSocket, socket } from "../../../utils/getSocket";
import { ChatEventGroup } from "../../../../../shared/socket.event";
import {
  setNewAdmin,
  setNewRole,
} from "../../../redux/features/groups/groupSlice";
import { UserNewRoleResponseType } from "../../../models/groupChat";
import View from "./View/View";

const GroupComp = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleOnClick = () => {
    handleClose();
  };

  useEffect(() => {
    connectSocket();
    socket.on(ChatEventGroup.NEW_ADMIN, (data: UserNewRoleResponseType) => {
      dispatch(setNewAdmin(data));
    });

    socket.on(
      ChatEventGroup.USER_ROLE_CHANGED,
      (data: UserNewRoleResponseType) => {
        dispatch(setNewRole(data));
      }
    );

    return () => {
      socket.off(ChatEventGroup.NEW_ADMIN);
      socket.off(ChatEventGroup.USER_ROLE_CHANGED);
    };
  }, [dispatch]);

  return (
    <>
      <Box width="320px" height="100vh">
        <Stack sx={{ height: "100%" }}>
          <Box
            sx={{
              boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
              width: "100%",
              backgroundColor:
                theme.palette.mode === "light"
                  ? "#F8FAFF"
                  : theme.palette.background.default,
              height: "70px",
            }}
          >
            <Stack
              sx={{ height: "100%", p: 2 }}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={3}
            >
              <Typography variant="subtitle2">Group Info</Typography>
              <IconButton onClick={() => dispatch(closeGroupSidebar())}>
                <X />
              </IconButton>
            </Stack>
          </Box>
          <Divider />
          <Stack
            sx={{
              height: "100%",
              position: "relative",
              flexGrow: "1",
              overflowY: "scroll",
            }}
            p={3}
            spacing={3}
          >
            <Stack height="80%" alignItems="center" direction="row" spacing={2}>
              <View />
            </Stack>
            <Divider />

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Bell size={22} />
                <Typography variant="subtitle2">Mute Notifications</Typography>
              </Stack>
              <Switch />
            </Stack>
            <Divider />
            <Stack direction="row" alignItems="center" spacing={2}>
              <Button
                size="small"
                startIcon={<Trash />}
                variant="outlined"
                fullWidth
                sx={{ textTransform: "capitalize" }}
                onClick={() => setOpen(true)}
              >
                Leave Group
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Box>
      {open && (
        <DialogI open={open} handleClose={handleClose}>
          <DialogTitle>Leave Group?</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              Do you really want to leave that group?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>No</Button>
            <Button onClick={handleOnClick}>Yes</Button>
          </DialogActions>
        </DialogI>
      )}
    </>
  );
};

export default GroupComp;
