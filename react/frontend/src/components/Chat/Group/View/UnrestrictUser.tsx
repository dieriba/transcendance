import {
  Stack,
  DialogContent,
  Alert,
  AlertColor,
  CircularProgress,
  Typography,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import DialogI from "../../../Dialog/DialogI";
import { SocketServerErrorResponse } from "../../../../services/type";
import { ChatRoleType } from "../../../../models/type-enum/typesEnum";
import { useTheme } from "@mui/material/styles";
import {
  useGetAllRestrictedUserQuery,
  useUnrestrictUserMutation,
} from "../../../../redux/features/groups/group.api.slice";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import {
  setRestrictedUser,
  unrestrictUser,
} from "../../../../redux/features/groups/group.slice";
import { RootState } from "../../../../redux/store";
interface UnrestrictUserProps {
  open: boolean;
  nickname: string;
  chatroomId: string;
  handleClose: () => void;
  role: ChatRoleType;
}

const UnRestrictUser = ({
  open,
  handleClose,
  chatroomId,
}: UnrestrictUserProps) => {
  const { data, isLoading, isError } = useGetAllRestrictedUserQuery(
    chatroomId,
    {
      refetchOnMountOrArgChange: true,
    }
  );
  const theme = useTheme();
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("success");
  const [openSnack, setOpenSnack] = useState(false);
  const dispatch = useAppDispatch();
  const handleCloseSnack = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnack(false);
  };

  useEffect(() => {
    if (data?.data) {
      dispatch(setRestrictedUser(data.data));
    }
  }, [data, dispatch]);

  const [UnrestrictUser, unrestrictedUserAction] = useUnrestrictUserMutation();

  const restrictedUsers = useAppSelector(
    (state: RootState) => state.groups.restrictedUser
  );

  const handleSubmit = async (id: string) => {
    try {
      const res = await UnrestrictUser({ id, chatroomId }).unwrap();
      dispatch(unrestrictUser({ data: res.data, chatroomId }));
      setMessage(res.message);
      setOpenSnack(true);
      setSeverity("success");
    } catch (error) {
      setSeverity("error");
      setMessage((error as SocketServerErrorResponse).message);
      setOpenSnack(true);
    }
  };

  if (isLoading) {
    <Stack p={3} sx={{ width: "100%" }} justifyContent="center">
      <CircularProgress />
    </Stack>;
  } else if (isError || !data) {
    <Stack alignItems="center" height="100%" pt={25} justifyContent="center">
      <Typography>An error has occured</Typography>
    </Stack>;
  } else {
    return (
      <>
        <DialogI maxWidth="md" open={open} handleClose={handleClose}>
          <DialogContent
            sx={{ backgroundColor: theme.palette.background.paper }}
          >
            <Stack
              sx={{ backgroundColor: theme.palette.background.paper }}
              width="100%"
              p={2}
            >
              <Stack spacing={2}>
                {openSnack && (
                  <Alert
                    onClose={handleCloseSnack}
                    severity={severity}
                    sx={{ width: "100%" }}
                  >
                    {message}
                  </Alert>
                )}
                {restrictedUsers.length === 0 ? (
                  <Stack
                    width="100%"
                    p={3}
                    justifyContent="center"
                    alignContent="center"
                  >
                    <Typography variant="body2">
                      No Restricted User yet
                    </Typography>
                  </Stack>
                ) : (
                  restrictedUsers.map((user, index) => (
                    <Stack
                      key={index}
                      width="100%"
                      alignItems="center"
                      p={3}
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Typography>{user.user.nickname}</Typography>
                      <Button variant="contained" color="inherit">
                        Restriction Info
                      </Button>
                      <Button
                        onClick={() => handleSubmit(user.user.id)}
                        variant="contained"
                        color="inherit"
                        disabled={unrestrictedUserAction.isLoading}
                      >
                        {`Unrestrict ${user.user.nickname}`}
                      </Button>
                    </Stack>
                  ))
                )}
              </Stack>
            </Stack>
          </DialogContent>
        </DialogI>
      </>
    );
  }
};

export default UnRestrictUser;