import {
  Stack,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Alert,
  AlertColor,
} from "@mui/material";
import DialogI from "../../Dialog/DialogI";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTheme } from "@mui/material/styles";
import { Eye, EyeSlash } from "phosphor-react";
import CustomTextField from "../../CustomTextField/CustomTextField";
import { useState } from "react";
import { useJoinGroupMutation } from "../../../redux/features/groups/group.api.slice";
import { SocketServerErrorResponse } from "../../../services/type";
import { useAppDispatch } from "../../../redux/hooks";
import {
  JoinProtectedGroupFormType,
  JoinProtectedGroupSchema,
} from "../../../models/groupChat";
import {
  addNewChatroom,
  deleteJoinableGroup,
} from "../../../redux/features/groups/group.slice";

interface ProtectGroupFormProps {
  chatroomId: string;
  open: boolean;
  handleClose: () => void;
}

const ProtectedGroupForm = ({
  open,
  handleClose,
  chatroomId,
}: ProtectGroupFormProps) => {
  const { control, handleSubmit } = useForm<JoinProtectedGroupFormType>({
    resolver: zodResolver(JoinProtectedGroupSchema),
  });

  const [joinProtectedGroup, { isLoading }] = useJoinGroupMutation();

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

  const dispatch = useAppDispatch();
  const onSubmit = async (data: JoinProtectedGroupFormType) => {
    try {
      const res = await joinProtectedGroup({
        password: data.password,
        chatroomId,
      }).unwrap();

      dispatch(deleteJoinableGroup(chatroomId));
      dispatch(addNewChatroom({ ...res.data, restrictedUsers: [] }));
      setSeverity("success");
      setMessage(res.message);
      setOpenSnack(true);
    } catch (error) {
      setSeverity("error");
      setMessage((error as SocketServerErrorResponse).message);
      setOpenSnack(true);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  const theme = useTheme();

  return (
    <>
      <DialogI maxWidth="sm" open={open} handleClose={handleClose}>
        <DialogTitle>Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} p={2}>
            {openSnack && (
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
                <Controller
                  name="password"
                  control={control}
                  render={({
                    field: { value, onChange },
                    fieldState: { error },
                  }) => (
                    <CustomTextField error={error} message={error?.message}>
                      <TextField
                        label="password"
                        fullWidth
                        value={value || ""}
                        onChange={onChange}
                        error={!!error}
                        type={showPassword ? "text" : "password"}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword((prev) => !prev)}
                              >
                                {showPassword ? <Eye /> : <EyeSlash />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </CustomTextField>
                  )}
                />

                <Button
                  color="inherit"
                  fullWidth
                  disabled={isLoading}
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
                  Join Room
                </Button>
              </Stack>
            </form>
          </Stack>
        </DialogContent>
      </DialogI>
    </>
  );
};

export default ProtectedGroupForm;
