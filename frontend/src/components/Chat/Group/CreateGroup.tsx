import {
  Stack,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Autocomplete,
  ButtonGroup,
  CircularProgress,
  Typography,
  Alert,
  AlertColor,
} from "@mui/material";
import DialogI from "../../Dialog/DialogI";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  CreateGroupFormType,
  CreateGroupSchema,
} from "../../../models/CreateGroupSchema";
import { useTheme } from "@mui/material/styles";
import { Eye, EyeSlash } from "phosphor-react";
import CustomTextField from "../../CustomTextField/CustomTextField";
import { useEffect, useState } from "react";
import RHFTextField from "../../controlled-components/RHFTextField";
import { useGetAllFriendsQuery } from "../../../redux/features/friends/friends.api.slice";
import { useCreateGroupMutation } from "../../../redux/features/groups/group.api.slice";
import { SocketServerErrorResponse } from "../../../services/type";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { setFriends } from "../../../redux/features/friends/friends.slice";

interface CreateGroupProps {
  open: boolean;
  handleClose: () => void;
}

const CreateGroup = ({ open, handleClose }: CreateGroupProps) => {
  const { control, handleSubmit, watch, setValue } =
    useForm<CreateGroupFormType>({
      resolver: zodResolver(CreateGroupSchema),
    });

  const [createGroupChat] = useCreateGroupMutation();

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

  const { data, isLoading, isError } = useGetAllFriendsQuery();

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data && data.data) {
      console.log(data.data);

      dispatch(setFriends(data.data));
    }
  }, [data, dispatch]);
  const friends = useAppSelector((state) => state.friends.friends);
  const onSubmit = async (data: CreateGroupFormType) => {
    try {
      if (data.users)
        data.users = friends
          .filter((friend) => data.users?.includes(friend.friend.nickname))
          .map((friend) => friend.friend.id);

      console.log({ data });

      const res = await createGroupChat(data).unwrap();

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

  const protectedType = watch("type");
  const [showPassword, setShowPassword] = useState(false);

  const theme = useTheme();

  const accessLevels = ["PUBLIC", "PRIVATE", "PROTECTED"];

  if (isLoading) {
    return (
      <Stack alignItems="center" height="100%" pt={25} justifyContent="center">
        <CircularProgress size={100} />
      </Stack>
    );
  } else if (isError || !data) {
    return (
      <Stack alignItems="center" height="100%" pt={25} justifyContent="center">
        <Typography>An error has occured</Typography>
      </Stack>
    );
  } else {
    return (
      <>
        <DialogI maxWidth="sm" open={open} handleClose={handleClose}>
          <DialogTitle>Create New Group</DialogTitle>
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
                    name="chatroomName"
                    label="chatroomName"
                    control={control}
                  />

                  <Controller
                    name="type"
                    control={control}
                    defaultValue="PUBLIC"
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
                          disabled={
                            protectedType === "PROTECTED" ? false : true
                          }
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
                                  onClick={() =>
                                    setShowPassword((prev) => !prev)
                                  }
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

                  <Controller
                    name="users"
                    control={control}
                    defaultValue={undefined}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <Autocomplete
                        options={friends.map(
                          (friend) => friend.friend.nickname
                        )}
                        multiple
                        getOptionLabel={(option) => option}
                        onChange={(_, selectedOption) =>
                          onChange(selectedOption)
                        }
                        renderInput={(params) => (
                          <CustomTextField
                            error={error}
                            message={error?.message}
                          >
                            <TextField {...params} error={!!error} />
                          </CustomTextField>
                        )}
                        onClick={() => {
                          console.log(value);
                        }}
                      />
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
                    disableElevation={true}
                  >
                    Create Group
                  </Button>
                </Stack>
              </form>
            </Stack>
          </DialogContent>
        </DialogI>
      </>
    );
  }
};

export default CreateGroup;
