import {
  Stack,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  ButtonGroup,
  CircularProgress,
  Alert,
  AlertColor,
} from "@mui/material";
import DialogI from "../../../../Dialog/DialogI";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTheme } from "@mui/material/styles";
import { Eye, EyeSlash } from "phosphor-react";
import CustomTextField from "../../../../CustomTextField/CustomTextField";
import { SocketServerErrorResponse } from "../../../../../services/type";
import { useAppDispatch, useAppSelector } from "../../../../../redux/hooks";
import {
  EditGroupSchema,
  EditGroupType,
} from "../../../../../models/EditGroupSchema";
import { useState } from "react";
import { RootState } from "../../../../../redux/store";
import { useEditGroupMutation } from "../../../../../redux/features/groups/group.api.slice";
import { ChatroomGroupType } from "../../../../../models/groupChat";
import { updateChatroom } from "../../../../../redux/features/groups/group.slice";

interface EditGroupProps {
  open: boolean;
  handleClose: () => void;
}

const EditGroup = ({ open, handleClose }: EditGroupProps) => {
  const { control, handleSubmit, watch, setValue } = useForm<EditGroupType>({
    resolver: zodResolver(EditGroupSchema),
  });
  const { type, id } = useAppSelector(
    (state: RootState) => state.groups.currentChatroom as ChatroomGroupType
  );
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

  const [editGroup, { isLoading }] = useEditGroupMutation();

  const onSubmit = async (editData: EditGroupType) => {
    try {
      editData.chatroomId = id;
      const { message, data } = await editGroup(editData).unwrap();
      dispatch(updateChatroom(data));
      setSeverity("success");
      setMessage(message);
      setOpenSnack(true);
    } catch (error) {
      console.log({ error });

      setSeverity("error");
      setMessage((error as SocketServerErrorResponse).message);
      setOpenSnack(true);
    }
  };

  const protectedType = watch("type");
  const [showPassword, setShowPassword] = useState(false);

  const theme = useTheme();

  const accessLevels = ["PUBLIC", "PRIVATE", "PROTECTED"];
  return (
    <>
      <DialogI maxWidth="sm" open={open} handleClose={handleClose}>
        <DialogTitle sx={{ backgroundColor: theme.palette.background.paper }} >
          Edit Group
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: theme.palette.background.paper }}>
          <Stack
            sx={{ backgroundColor: theme.palette.background.paper }}
            spacing={2}
            p={2}
          >
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
                  name="type"
                  control={control}
                  defaultValue={type}
                  render={({ field }) => (
                    <ButtonGroup fullWidth>
                      {accessLevels.map((level) => (
                        <Button
                          size="large"
                          key={level}
                          sx={{
                            borderColor:
                              level === field.value
                                ? theme.palette.primary.main
                                : "",
                          }}
                          onClick={() => {
                            field.onChange(level);
                            setValue("password", undefined);
                          }}
                        >
                          {level}
                        </Button>
                      ))}
                    </ButtonGroup>
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  render={({
                    field: { value, onChange },
                    fieldState: { error },
                  }) => (
                    <CustomTextField error={error} message={error?.message}>
                      <TextField
                        disabled={protectedType === "PROTECTED" ? false : true}
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
                >
                  {isLoading ? <CircularProgress /> : "Edit Group"}
                </Button>
              </Stack>
            </form>
          </Stack>
        </DialogContent>
      </DialogI>
    </>
  );
};

export default EditGroup;
