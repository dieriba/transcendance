import {
  Stack,
  Divider,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  AlertColor,
  Alert,
} from "@mui/material";
import { Trash } from "phosphor-react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import DialogI from "../../Dialog/DialogI";
import { useState } from "react";
import { leaveChatroom } from "../../../redux/features/groups/group.slice";
import View from "./View/View";
import { SocketServerErrorResponse } from "../../../services/type";
import { RootState } from "../../../redux/store";
import { ChatRoleType, ROLE } from "../../../models/type-enum/typesEnum";
import {
  useDeleteGroupMutation,
  useLeaveGroupMutation,
} from "../../../redux/features/groups/group.api.slice";
import { useTheme } from "@mui/material/styles";
interface GroupCompProps {
  openDialog: boolean;
  handleClose: () => void;
}

const GroupComp = ({ openDialog, handleClose }: GroupCompProps) => {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState<{ leave: boolean; delete: boolean }>({
    leave: false,
    delete: false,
  });
  const theme = useTheme();
  const handleCloseSnack = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnack(false);
  };

  const role = useAppSelector(
    (state: RootState) => state.groups.role
  ) as ChatRoleType;

  const chatroomId = useAppSelector(
    (state: RootState) => state.groups.currentGroupChatroomId
  ) as string;

  const handleCloseLeave = () => {
    setOpen((prev) => ({ ...prev, leave: false }));
  };

  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("success");
  const [openSnack, setOpenSnack] = useState(false);

  const handleCloseDelete = () => {
    setOpen((prev) => ({ ...prev, delete: false }));
  };

  const [leaveGroup, { isLoading }] = useLeaveGroupMutation();
  const [deleteGroup, deleteGroupMutation] = useDeleteGroupMutation();

  const handleOnClickLeave = async () => {
    try {
      const res = await leaveGroup({ chatroomId }).unwrap();

      dispatch(leaveChatroom({ chatroomId: res.data.chatroomId }));
      setSeverity("success");
      setMessage(res.message);
      setOpenSnack(true);
    } catch (error) {
      console.log({ error });

      setSeverity("error");
      setMessage((error as SocketServerErrorResponse).message);
      setOpenSnack(true);
    }
  };

  const handleOnClickDelete = async () => {
    try {
      const res = await deleteGroup({ chatroomId }).unwrap();

      dispatch(leaveChatroom({ chatroomId: res.data.chatroomId }));
      setSeverity("success");
      setMessage(res.message);
      setOpenSnack(true);
    } catch (error) {
      console.log({ error });

      setSeverity("error");
      setMessage((error as SocketServerErrorResponse).message);
      setOpenSnack(true);
    }
  };

  return (
    <>
      <DialogI open={openDialog} handleClose={handleClose}>
        <DialogTitle sx={{ backgroundColor: theme.palette.background.paper }}>
          {"Group Info"}
        </DialogTitle>
        <Stack
          sx={{
            backgroundColor: theme.palette.background.paper,
            height: "100%",
          }}
        >
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
            <Stack direction="row" alignItems="center" spacing={2}>
              {role === ROLE.DIERIBA && (
                <Button
                  size="small"
                  startIcon={<Trash />}
                  variant="outlined"
                  fullWidth
                  sx={{ textTransform: "capitalize" }}
                  onClick={() => setOpen((prev) => ({ ...prev, delete: true }))}
                >
                  Delete Group
                </Button>
              )}
              <Button
                size="small"
                startIcon={<Trash />}
                variant="outlined"
                fullWidth
                sx={{ textTransform: "capitalize" }}
                onClick={() => setOpen((prev) => ({ ...prev, leave: true }))}
              >
                Leave Group
              </Button>
            </Stack>
          </Stack>
        </Stack>
        {open.leave && (
          <DialogI open={open.leave} handleClose={handleCloseLeave}>
            <DialogTitle>Leave Group?</DialogTitle>
            <DialogContent>
              {openSnack && (
                <Alert
                  onClose={handleCloseSnack}
                  severity={severity}
                  sx={{ width: "100%" }}
                >
                  {message}
                </Alert>
              )}
              <DialogContentText id="alert-dialog-slide-description">
                {role === ROLE.DIERIBA
                  ? "Do you really want to leave that group, Please note that upon leaving the group, your privileges will be forfeited and randomly transferred to another user if present. If no users remain in the group, it will be deleted."
                  : "Do you really want to leave that group?"}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseLeave}>No</Button>
              <Button disabled={isLoading} onClick={handleOnClickLeave}>
                Yes
              </Button>
            </DialogActions>
          </DialogI>
        )}
        {role === ROLE.DIERIBA && open.delete && (
          <DialogI open={open.delete} handleClose={handleCloseDelete}>
            <DialogTitle>Delete Group?</DialogTitle>
            <DialogContent>
              {openSnack && (
                <Alert
                  onClose={handleCloseSnack}
                  severity={severity}
                  sx={{ width: "100%" }}
                >
                  {message}
                </Alert>
              )}
              <DialogContentText id="alert-dialog-slide-description">
                Please be aware that deleting your group will result in the loss
                of all messages and the removal of all users from the group,
                along with the deletion of the group itself.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseLeave}>No</Button>
              <Button
                disabled={deleteGroupMutation.isLoading}
                onClick={handleOnClickDelete}
              >
                Yes
              </Button>
            </DialogActions>
          </DialogI>
        )}
      </DialogI>
    </>
  );
};

export default GroupComp;
