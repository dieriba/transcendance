import { Snackbar, Alert, Stack, Typography, Button } from "@mui/material";
import { GAME_INVITATION_TIME_LIMIT_SNACKBAR } from "../../../../../shared/constant";
import { BaseUserTypeId } from "../../../../models/login/UserSchema";
import {
  useAcceptGameInvitationMutation,
  useDeclineGameInvitationMutation,
} from "../../../../redux/features/pong/pong.api.slice";

interface ReceivedGameInvitationProps {
  open: boolean;
  onClose: () => void;
  id: string;
  message: string;
}

const ReceivedGameInvitation = ({
  open,
  onClose,
  message,
  id,
}: ReceivedGameInvitationProps) => {
  const [acceptGameInvitation, acceptGameInvitationAction] =
    useAcceptGameInvitationMutation();

  const [declineGameInvitation, declineGameInvitationAction] =
    useDeclineGameInvitationMutation();

  const accept = async (data: BaseUserTypeId) => {
    try {
      await acceptGameInvitation(data).unwrap();
      onClose();
    } catch (error) {
      onClose();
    }
  };

  const decline = async (data: BaseUserTypeId) => {
    try {
      await declineGameInvitation(data).unwrap();
      console.log("success");

      onClose();
    } catch (error) {
      console.log({ error });

      onClose();
    }
  };

  const clickable =
    acceptGameInvitationAction.isLoading ||
    declineGameInvitationAction.isLoading;

  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={open}
      autoHideDuration={GAME_INVITATION_TIME_LIMIT_SNACKBAR}
      onClose={onClose}
      sx={{ maxWidth: "90%" }}
    >
      <Alert severity="info">
        <Stack
          height={"50px"}
          alignItems={"center"}
          direction={"row"}
          spacing={2}
        >
          <Typography variant="body2">{message}</Typography>
          <Button
            size="small"
            onClick={() => accept({ id })}
            variant="contained"
            color="inherit"
            disabled={clickable}
          >
            Accept
          </Button>
          <Button
            size="small"
            onClick={() => decline({ id })}
            variant="contained"
            color="error"
            disabled={clickable}
          >
            Decline
          </Button>
        </Stack>
      </Alert>
    </Snackbar>
  );
};

export default ReceivedGameInvitation;
