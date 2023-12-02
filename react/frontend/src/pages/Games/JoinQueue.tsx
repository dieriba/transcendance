import {
  Button,
  CircularProgress,
  DialogContent,
  DialogProps,
  Stack,
  Typography,
} from "@mui/material";
import DialogI from "../../components/Dialog/DialogI";
import { useLeaveQueueMutation } from "../../redux/features/pong/pong.api.slice";

interface JoinQueueProps extends DialogProps {
  handleClose: () => void;
}

const JoinQueue = ({ handleClose, open }: JoinQueueProps) => {
  const [leaveQueue, leaveQueueAction] = useLeaveQueueMutation();

  const handleLeaveQueue = async () => {
    try {
      await leaveQueue().unwrap();
      handleClose();
    } catch (error) {
      /*  */
    }
    handleClose();
  };

  return (
    <DialogI open={open} handleClose={handleLeaveQueue}>
      <DialogContent>
        <Stack alignItems={"center"} justifyContent={"center"} spacing={5}>
          <CircularProgress size={100} />
          <Typography>Please wait</Typography>
          <Button
            disabled={leaveQueueAction.isLoading}
            variant="contained"
            color="inherit"
            onClick={handleLeaveQueue}
          >
            Leave Queue
          </Button>
        </Stack>
      </DialogContent>
    </DialogI>
  );
};

export default JoinQueue;
