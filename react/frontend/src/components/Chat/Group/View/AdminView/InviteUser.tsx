import { Button, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useForm } from "react-hook-form";
import RHFTextField from "../../../../controlled-components/RHFTextField";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  InviteUserToGroupType,
  InviteUserToGroupSchema,
} from "../../../../../models/groupChat";
import { useAppDispatch, useAppSelector } from "../../../../../redux/hooks";
import { SocketServerErrorResponse } from "../../../../../services/type";
import { RootState } from "../../../../../redux/store";
import { useInviteUserMutation } from "../../../../../redux/features/groups/group.api.slice";
import { showSnackBar } from "../../../../../redux/features/app/app.slice";

const InviteUser = () => {
  const { control, handleSubmit } = useForm<InviteUserToGroupType>({
    resolver: zodResolver(InviteUserToGroupSchema),
  });
  const dispatch = useAppDispatch();
  const chatroomId = useAppSelector(
    (state: RootState) => state.groups.currentGroupChatroomId
  );

  const [inviteUser, { isLoading }] = useInviteUserMutation();

  const onSubmit = async (data: InviteUserToGroupType) => {
    try {
      data.chatroomId = chatroomId;

      const res = await inviteUser(data).unwrap();

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
  const theme = useTheme();

  return (
    <>
      <Stack
        sx={{ backgroundColor: theme.palette.background.paper }}
        spacing={2}
        p={2}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <RHFTextField name="nickname" label="Nickname" control={control} />
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
