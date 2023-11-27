import { Alert, AlertColor, Button, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useForm } from "react-hook-form";
import RHFTextField from "../../../../controlled-components/RHFTextField";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  InviteUserToGroupType,
  InviteUserToGroupSchema,
} from "../../../../../models/groupChat";
import { useAppSelector } from "../../../../../redux/hooks";
import { SocketServerErrorResponse } from "../../../../../services/type";
import { RootState } from "../../../../../redux/store";
import { useInviteUserMutation } from "../../../../../redux/features/groups/group.api.slice";

const InviteUser = () => {
  const { control, handleSubmit } = useForm<InviteUserToGroupType>({
    resolver: zodResolver(InviteUserToGroupSchema),
  });

  const chatroomId = useAppSelector(
    (state: RootState) => state.groups.currentGroupChatroomId
  );

  const [inviteUser, { isLoading }] = useInviteUserMutation();

  const onSubmit = async (data: InviteUserToGroupType) => {
    try {
      data.chatroomId = chatroomId;

      const res = await inviteUser(data).unwrap();

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
  const theme = useTheme();

  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("success");
  const [openSnack, setOpenSnack] = useState(false);

  const handleCloseSnack = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnack(false);
  };
  return (
    <>
      <Stack
        sx={{ backgroundColor: theme.palette.background.paper }}
        spacing={2}
        p={2}
      >
        {message?.length > 0 && openSnack && (
          <Alert
            onClose={handleCloseSnack}
            severity={severity}
            sx={{ width: "100%" }}
          >
            {message}
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <RHFTextField
              name="nickname"
              label="Nickname"
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
              disabled={isLoading}
            >
              Invite User
            </Button>
          </Stack>
        </form>
      </Stack>
    </>
  );
};

export default InviteUser;
