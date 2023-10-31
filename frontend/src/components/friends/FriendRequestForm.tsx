import {
  Stack,
  DialogContent,
  DialogTitle,
  Button,
  AlertColor,
  Snackbar,
  Alert,
} from "@mui/material";
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
import { useState } from "react";

interface CreateGroupProps {
  open: boolean;
  handleClose: () => void;
}

const FriendRequestForm = ({ open, handleClose }: CreateGroupProps) => {
  const { control, handleSubmit } = useForm<FriendRequestType>({
    resolver: zodResolver(FriendRequestSchema),
  });
  const [sendFriendRequest, { isLoading }] = useSendFriendRequestMutation();

  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("success");
  const [openSnack, setOpenSnack] = useState(false);

  const handleCloseSnack = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnack(false);
  };

  const theme = useTheme();

  const onSubmit = async (data: FriendRequestType) => {
    try {
      const res = await sendFriendRequest(data).unwrap();
      console.log(res);

      setSeverity("success");
      setMessage(res as string);
      setOpenSnack(true);
    } catch (error) {
      setSeverity("error");
      setMessage(error.message);
      setOpenSnack(true);
      console.log(error);
    }
  };

  return (
    <DialogI maxWidth="sm" open={open} handleClose={handleClose}>
      <DialogTitle>Add new Friend </DialogTitle>
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
        <Stack p={2}>
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
