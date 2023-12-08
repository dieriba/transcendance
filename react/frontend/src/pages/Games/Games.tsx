import { Alert, AlertColor, Button, Stack } from "@mui/material";
import { useState } from "react";
import { useJoinQueueMutation } from "../../redux/features/pong/pong.api.slice";
import { SocketServerErrorResponse } from "../../services/type";
import JoinQueue from "./JoinQueue";

const Games = () => {
  const [open, setOpen] = useState<{ queue: boolean }>({ queue: false });

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

  const [joinQueu, { isLoading }] = useJoinQueueMutation();

  const handleJoinQueue = async () => {
    try {
      await joinQueu().unwrap();

      setOpen((prev) => ({ ...prev, queue: true }));
    } catch (error) {
      setSeverity("error");
      setMessage((error as SocketServerErrorResponse).message);
      setOpenSnack(true);
    }
  };

  return (
    <>
      <Stack
        height={"100vh"}
        width={"100%"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Stack width={"300px"} spacing={1}>
          {openSnack && (
            <Alert
              onClose={handleCloseSnack}
              severity={severity}
              sx={{ width: "100%" }}
            >
              {message}
            </Alert>
          )}
          <Button
            disabled={isLoading}
            onClick={handleJoinQueue}
            variant="contained"
            color="inherit"
          >
            Join Queue
          </Button>
          <Button disabled={isLoading} variant="contained" color="inherit">
            Join Special Queue
          </Button>
          <Button variant="contained" color="inherit">
            Spectate a game
          </Button>
        </Stack>
      </Stack>
      {open.queue && (
        <JoinQueue
          open={open.queue}
          handleClose={() => {
            setOpen((prev) => ({ ...prev, queue: false }));
          }}
        />
      )}
    </>
  );
};

export default Games;
