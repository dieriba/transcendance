import {
  Autocomplete,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Controller, useForm } from "react-hook-form";
import CustomTextField from "../../../../CustomTextField/CustomTextField";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
  AddNewUserToGroupType,
  AddNewUserToGroupSchema,
} from "../../../../../models/groupChat";
import { useGetAllFriendsQuery } from "../../../../../redux/features/friends/friends.api.slice";
import { setFriends } from "../../../../../redux/features/friends/friends.slice";
import { useAddUserMutation } from "../../../../../redux/features/groups/group.api.slice";
import { useAppDispatch, useAppSelector } from "../../../../../redux/hooks";
import { SocketServerErrorResponse } from "../../../../../services/type";
import { RootState } from "../../../../../redux/store";
import { showSnackBar } from "../../../../../redux/features/app/app.slice";

const AddUser = () => {
  const { data, isLoading, isError } = useGetAllFriendsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data && data.data) {
      dispatch(setFriends(data.data));
    }
  }, [data, dispatch]);

  const { control, handleSubmit } = useForm<AddNewUserToGroupType>({
    resolver: zodResolver(AddNewUserToGroupSchema),
  });

  const friends = useAppSelector((state: RootState) => state.friends.friends);
  const chatroomId = useAppSelector(
    (state: RootState) => state.groups.currentGroupChatroomId
  );

  const [addUser, addUserMethod] = useAddUserMutation();

  const onSubmit = async (data: AddNewUserToGroupType) => {
    try {
      data.chatroomId = chatroomId;
      if (data.users && data.users.length > 0)
        data.users = friends
          .filter((friend) => data.users?.includes(friend.friend.nickname))
          .map((friend) => friend.friend.id);

      const res = await addUser(data).unwrap();

      dispatch(showSnackBar({ message: res.message }));
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
        <Stack
          sx={{ backgroundColor: theme.palette.background.paper }}
          spacing={2}
          p={2}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <Controller
                name="users"
                control={control}
                defaultValue={undefined}
                render={({ field: { onChange }, fieldState: { error } }) => (
                  <Autocomplete
                    options={friends.map((friend) => friend.friend.nickname)}
                    multiple
                    getOptionLabel={(option) => option}
                    onChange={(_, selectedOption) => onChange(selectedOption)}
                    renderInput={(params) => (
                      <CustomTextField error={error} message={error?.message}>
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
      </>
    );
  }
};

export default AddUser;
