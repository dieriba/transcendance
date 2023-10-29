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

interface CreateGroupProps {
  open: boolean;
  handleClose: () => void;
}

const FriendRequestForm = ({ open, handleClose }: CreateGroupProps) => {
  const { control, handleSubmit } = useForm<FriendRequestType>({
    resolver: zodResolver(FriendRequestSchema),
  });

  const theme = useTheme();

  const onSubmit = async (data: FriendRequestType) => {
    console.log(data);
  };

  return (
    <DialogI maxWidth="sm" open={open} handleClose={handleClose}>
      <DialogTitle>Add new Friend </DialogTitle>
      <DialogContent>
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
