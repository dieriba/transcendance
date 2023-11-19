import {
  Stack,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Autocomplete,
  CircularProgress,
  Typography,
  Alert,
  AlertColor,
  Divider,
} from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import {
  AddNewUserToGroupSchema,
  AddNewUserToGroupType,
} from "../../../../../models/groupChat";
import { useGetAllFriendsQuery } from "../../../../../redux/features/friends/friends.api.slice";
import { useAppDispatch, useAppSelector } from "../../../../../redux/hooks";
import { setFriends } from "../../../../../redux/features/friends/friends.slice";
import { useAddUserMutation } from "../../../../../redux/features/groups/group.api.slice";
import { SocketServerErrorResponse } from "../../../../../services/type";
import CustomTextField from "../../../../CustomTextField/CustomTextField";
import DialogI from "../../../../Dialog/DialogI";
import RHFTextField from "../../../../controlled-components/RHFTextField";
import { RootState } from "../../../../../redux/store";

interface AddUserProps {
  open: boolean;
  handleClose: () => void;
}

const AddUser = ({ open, handleClose }: AddUserProps) => {
  const { control, handleSubmit } = useForm<AddNewUserToGroupType>({
    resolver: zodResolver(AddNewUserToGroupSchema),
  });

  const [addUser, addUserMethod] = useAddUserMutation();

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

  const { data, isLoading, isError } = useGetAllFriendsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data && data.data) {
      dispatch(setFriends(data.data));
    }
  }, [data, dispatch]);
  const friends = useAppSelector((state: RootState) => state.friends.friends);
  const chatroomId = useAppSelector(
    (state: RootState) => state.groups.currentGroupChatroomId
  );

  const onSubmit = async (data: AddNewUserToGroupType) => {
    try {
      data.chatroomId = chatroomId;
      if (data.users && data.users.length > 0)
        data.users = friends
          .filter((friend) => data.users?.includes(friend.friend.nickname))
          .map((friend) => friend.friend.id);

      const res = await addUser(data).unwrap();

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
          <DialogTitle sx={{ backgroundColor: theme.palette.background.paper }}>
            Add new User
          </DialogTitle>
          <DialogContent
            sx={{ backgroundColor: theme.palette.background.paper }}
            >
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
                    name="newUserId"
                    label="Nickname"
                    control={control}
                  />
                  <Divider
                    sx={{
                      my: 2.5,
                      typography: "overline",
                      color: "text.disabled",
                      "&::before, ::after": { borderTopStyle: "solid" },
                    }}
                  >
                    OR
                  </Divider>
                  <Controller
                    name="users"
                    control={control}
                    defaultValue={undefined}
                    render={({
                      field: { onChange },
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
                    disabled={addUserMethod.isLoading}
                  >
                    ADD NEW USER
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

export default AddUser;
