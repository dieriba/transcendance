import { Stack, DialogContent, DialogTitle, Button } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTheme } from "@mui/material/styles";
import DialogI from "../Dialog/DialogI";
import RHFTextField from "../controlled-components/RHFTextField";
import {
  FriendRequestSchema,
  FriendRequestType,
} from "../../models/FriendRequestSchema";
import { useSendFriendRequestMutation } from "../../redux/features/friends/friends.api.slice";
import { SocketServerErrorResponse } from "../../services/type";
import { showSnackBar } from "../../redux/features/app/app.slice";
import { useAppDispatch } from "../../redux/hooks";

interface CreateGroupProps {
  open: boolean;
  handleClose: () => void;
}

const FriendRequestForm = ({ open, handleClose }: CreateGroupProps) => {
  const { control, handleSubmit } = useForm<FriendRequestType>({
    resolver: zodResolver(FriendRequestSchema),
  });
  const [sendFriendRequest, { isLoading }] = useSendFriendRequestMutation();

  const theme = useTheme();
  const dispatch = useAppDispatch();
  const onSubmit = async (data: FriendRequestType) => {
    try {
      const res = await sendFriendRequest(data).unwrap();
      dispatch(
        showSnackBar({
          message: res.message,
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
    <DialogI maxWidth="sm" open={open} handleClose={handleClose}>
      <DialogTitle>Add new Friend </DialogTitle>
      <DialogContent>
        <Stack spacing={2} p={2}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <RHFTextField
                name="nickname"
                label="nickname"
                control={control}
              />

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
              >
                Send Friend Request
              </Button>
            </Stack>
          </form>
        </Stack>
      </DialogContent>
    </DialogI>
  );
};

export default FriendRequestForm;
