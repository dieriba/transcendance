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
import DialogI from "../../../../Dialog/DialogI";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../redux/hooks";
import { RootState } from "../../../../../redux/store";
import { SocketServerErrorResponse } from "../../../../../services/type";
import { setNewAdmin } from "../../../../../redux/features/groups/group.slice";
import { useSetNewDieribaMutation } from "../../../../../redux/features/groups/group.api.slice";
import { ChatroomGroupType } from "../../../../../models/groupChat";

interface SetAdminProps {
  open: boolean;
  handleClose: () => void;
  nickname: string;
  id: string;
}

const SetAsAdmin = ({ id, nickname, open, handleClose }: SetAdminProps) => {
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

  const [setDieriba, { isLoading }] = useSetNewDieribaMutation();

  const onSubmit = async (data: {
    id: string;
    chatroomName: string;
    chatroomId: string;
  }) => {
    try {
      const response = await setDieriba(data).unwrap();

      dispatch(setNewAdmin(response.data));
      handleClose();
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
        <DialogTitle>Set New Admin</DialogTitle>
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
            <Typography>{`This action is not reversible and will set ${
              nickname.toUpperCase() as string
            } as new chat admin and YOU as regular group user, are you sure to continue?`}</Typography>
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
                onClick={() =>
                  onSubmit({
                    id,
                    chatroomId: currentChatroom.id,
                    chatroomName: currentChatroom.chatroomName,
                  })
                }
              >
                {isLoading ? (
                  <CircularProgress />
                ) : (
                  `Set ${nickname} as new chat ADMIN`
                )}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </DialogI>
    </>
  );
};

export default SetAsAdmin;
