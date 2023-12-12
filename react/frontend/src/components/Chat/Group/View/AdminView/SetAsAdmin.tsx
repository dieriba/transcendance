import {
  Button,
  CircularProgress,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DialogI from "../../../../Dialog/DialogI";
import { useAppDispatch, useAppSelector } from "../../../../../redux/hooks";
import { RootState } from "../../../../../redux/store";
import { SocketServerErrorResponse } from "../../../../../services/type";
import { setNewAdmin } from "../../../../../redux/features/groups/group.slice";
import { useSetNewDieribaMutation } from "../../../../../redux/features/groups/group.api.slice";
import { ChatroomGroupType } from "../../../../../models/groupChat";
import { showSnackBar } from "../../../../../redux/features/app/app.slice";

interface SetAdminProps {
  open: boolean;
  handleClose: () => void;
  nickname: string;
  id: string;
}

const SetAsAdmin = ({ id, nickname, open, handleClose }: SetAdminProps) => {
  const dispatch = useAppDispatch();

  const currentChatroom = useAppSelector(
    (state: RootState) => state.groups.currentChatroom as ChatroomGroupType
  );
  const theme = useTheme();
  const [setDieriba, { isLoading }] = useSetNewDieribaMutation();

  const onSubmit = async (data: { id: string; chatroomId: string }) => {
    try {
      const response = await setDieriba(data).unwrap();

      dispatch(
        setNewAdmin({ data: response.data, chatroomId: data.chatroomId })
      );
      handleClose();
      dispatch(
        showSnackBar({
          message: response.message,
        })
      );
    } catch (error) {
      dispatch(
        showSnackBar({
          message: (error as SocketServerErrorResponse).message,
          severity: "error",
        })
      );
    }
  };

  return (
    <>
      <DialogI maxWidth="sm" open={open} handleClose={handleClose}>
        <DialogTitle sx={{ backgroundColor: theme.palette.background.paper }}>
          Set New Admin
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: theme.palette.background.paper }}>
          <Stack
            sx={{ backgroundColor: theme.palette.background.paper }}
            spacing={2}
            p={2}
          >
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
                onClick={() =>
                  onSubmit({
                    id,
                    chatroomId: currentChatroom.id,
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
