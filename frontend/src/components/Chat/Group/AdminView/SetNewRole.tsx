import {
  Alert,
  AlertColor,
  Button,
  CircularProgress,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DialogI from "../../../Dialog/DialogI";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { RootState } from "../../../../redux/store";
import { SocketServerErrorResponse } from "../../../../services/type";
import { useSetNewRoleMutation } from "../../../../redux/features/groups/group.api.slice";
import { ChatroomGroupType } from "../../../../models/groupChat";
import { setNewRole } from "../../../../redux/features/groups/groupSlice";
import { ChatRoleType } from "../../../../models/type-enum/typesEnum";

interface SetNewRoleProps {
  open: boolean;
  handleClose: () => void;
  nickname: string;
  id: string;
  role: ChatRoleType;
}

const SetNewRole = ({
  id,
  nickname,
  open,
  role,
  handleClose,
}: SetNewRoleProps) => {
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("success");
  const [openSnack, setOpenSnack] = useState(false);
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

  const dispatch = useAppDispatch();

  const currentChatroom = useAppSelector(
    (state: RootState) => state.groups.currentChatroom as ChatroomGroupType
  );

  const [changeUserRole, { isLoading }] = useSetNewRoleMutation();

  const onSubmit = async () => {
    try {
      const { chatroomName } = currentChatroom;

      const response = await changeUserRole({
        id,
        chatroomId: currentChatroom.id,
        chatroomName,
        role,
      }).unwrap();

      console.log({ response });
      dispatch(setNewRole(response.data));
    } catch (error) {
      console.log({ error });

      setSeverity("error");
      setMessage((error as SocketServerErrorResponse).message);
      setOpenSnack(true);
    }
  };

  return (
    <>
      <DialogI maxWidth="sm" open={open} handleClose={handleClose}>
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent>
          <Stack spacing={2} p={2}>
            {openSnack && (
              <Alert
                onClose={handleCloseSnack}
                severity={severity}
                sx={{ width: "100%" }}
              >
                {message}
              </Alert>
            )}
            <Typography>{`This action will set ${
              nickname.toUpperCase() as string
            } as new moderator , do you want to continue?`}</Typography>
            <Stack spacing={3}>
              <Button
                color="inherit"
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{
                  ":hover": {
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: 1.5,
                    color: "white",
                  },
                }}
                disableElevation={true}
                onClick={() => onSubmit()}
              >
                {isLoading ? (
                  <CircularProgress />
                ) : (
                  `Set ${nickname} as ${
                    role === "CHAT_ADMIN" ? "Moderator" : "Regular User"
                  }`
                )}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </DialogI>
    </>
  );
};

export default SetNewRole;
