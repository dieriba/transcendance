import {
  Avatar,
  Box,
  Button,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { CloudArrowUp } from "phosphor-react";
import {
  UploadAvatarSchema,
  UploadAvatarType,
} from "../../models/NewAvatarSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import CustomTextField from "../../components/CustomTextField/CustomTextField";
import {
  useChangeAvatarMutation,
  useNotifyNewProfilePicMutation,
  useUpdateUserMutation,
} from "../../redux/features/user/user.api.slice";
import {
  setNewAvatarSrc,
  setNewNickname,
} from "../../redux/features/user/user.slice";
import {
  isErrorWithMessage,
  isFetchBaseQueryError,
} from "../../services/helpers";
import {
  UpdateUserSchema,
  UpdateUserType,
} from "../../models/login/UserSchema";
import { SocketServerErrorResponse } from "../../services/type";
import RHFTextField from "../../components/controlled-components/RHFTextField";
import { RootState } from "../../redux/store";
import { CHATBAR_WIDTH } from "../../utils/constant";
import { showSnackBar } from "../../redux/features/app/app.slice";
const ProfilePage = () => {
  const theme = useTheme();
  const user = useAppSelector((state: RootState) => state.user.user);
  const dispatch = useAppDispatch();
  const [file, setFile] = useState<File>();
  const [image, setImage] = useState<string | undefined>(undefined);
  const [changeAvatar, { isLoading }] = useChangeAvatarMutation();
  const [notifyNewProfilePic] = useNotifyNewProfilePicMutation();
  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });

  const { control, handleSubmit, reset } = useForm<UploadAvatarType>({
    resolver: zodResolver(UploadAvatarSchema),
  });

  const methods = useForm<UpdateUserType>({
    resolver: zodResolver(UpdateUserSchema),
  });

  const onlyMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [updateUser, updateUserAction] = useUpdateUserMutation();
  const loadImage = (file: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file as Blob);
      reader.onload = () =>
        typeof reader.result === "string"
          ? resolve(reader.result)
          : reject(reader.result);
      reader.onerror = (error) => reject(error);
    });

  useEffect(() => {
    if (file)
      loadImage(file)
        .then(setImage)
        .catch(() => setImage(undefined));
  }, [file]);

  const onSubmit = async ({ avatar }: UploadAvatarType) => {
    try {
      const formData = new FormData();
      formData.append("avatar", avatar[0]);

      const { message, data } = await changeAvatar(formData).unwrap();

      dispatch(setNewAvatarSrc(data.data));
      await notifyNewProfilePic({ avatar: data.data }).unwrap();
      dispatch(showSnackBar({ message }));
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        if (
          err.data &&
          typeof err.data === "object" &&
          ("message" in err.data || "error" in err.data)
        ) {
          if ("message" in err.data) {
            dispatch(
              showSnackBar({
                message: err.data.message as string,
                severity: "error",
              })
            );
            return;
          }
          dispatch(
            showSnackBar({
              message: err.data.error as string,
              severity: "error",
            })
          );
        } else {
          dispatch(
            showSnackBar({
              message: "An error has occured, please try again later!",
              severity: "error",
            })
          );
        }
      } else if (isErrorWithMessage(err)) {
        dispatch(showSnackBar({ message: err.message, severity: "error" }));
      }
    }
  };

  const handleOnSubmitUpdateUser = async (data: UpdateUserType) => {
    try {
      const res = await updateUser(data).unwrap();

      dispatch(setNewNickname(res.data.nickname));
      dispatch(showSnackBar({ message: res.message }));
    } catch (err) {
      dispatch(
        showSnackBar({
          message: (err as SocketServerErrorResponse).message,
          severity: "error",
        })
      );
    }
  };

  return (
    <>
      <Stack direction={"row"} sx={{ width: "100%" }}>
        <Box
          sx={{
            position: "relative",
            backgroundColor:
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background.paper,
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
            width: onlyMediumScreen ? "100vw" : `${CHATBAR_WIDTH}px`,
            height: onlyMediumScreen ? "100vh" : "auto",
          }}
        >
          <Stack p={4} alignItems={"center"} spacing={5}>
            <Stack direction="row" alignItems="center" spacing={3}>
              <Typography variant="h5">Profile</Typography>
            </Stack>
            <Stack spacing={2} alignItems={"center"}>
              {image ? (
                <>
                  <Stack spacing={1} alignItems="center" fontStyle={"italic"}>
                    <Button
                      onClick={() => {
                        setImage(undefined);
                        reset();
                      }}
                      fullWidth
                      color="inherit"
                    >
                      Remove Preview
                    </Button>
                    <Avatar sx={{ width: 100, height: 100 }} src={image} />
                  </Stack>
                </>
              ) : (
                <>
                  <Avatar
                    sx={{ width: 100, height: 100 }}
                    src={
                      user?.profile?.avatar ? user?.profile.avatar : undefined
                    }
                  />
                </>
              )}
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2} alignItems={"center"}>
                  <Controller
                    name="avatar"
                    control={control}
                    render={({
                      field: { ref, name, onChange },
                      fieldState: { error },
                    }) => (
                      <CustomTextField error={error} message={error?.message}>
                        <Button
                          fullWidth
                          component="label"
                          variant="contained"
                          startIcon={<CloudArrowUp />}
                          color="inherit"
                        >
                          Choose new avatar
                          <VisuallyHiddenInput
                            onChange={(e) => {
                              onChange(e.target.files);
                              if (e.target.files && e.target.files.length > 0) {
                                setFile(e.target.files[0]);
                              }
                            }}
                            ref={ref}
                            name={name}
                            type="file"
                            accept="image/jpg,image/jpeg,image/png"
                          />
                        </Button>
                      </CustomTextField>
                    )}
                  />
                  {image && (
                    <Button
                      variant="contained"
                      fullWidth
                      size="medium"
                      color="inherit"
                      type="submit"
                      disabled={isLoading || updateUserAction.isLoading}
                    >
                      Upload Avatar
                    </Button>
                  )}
                </Stack>
              </form>
              <Stack>
                <form onSubmit={methods.handleSubmit(handleOnSubmitUpdateUser)}>
                  <Stack spacing={1}>
                    <RHFTextField
                      defaultValue={user?.nickname}
                      control={methods.control}
                      name="nickname"
                      label="nickname"
                    />
                    <Button
                      variant="contained"
                      fullWidth
                      color="inherit"
                      type="submit"
                      disabled={isLoading || updateUserAction.isLoading}
                    >
                      Edit Nickname
                    </Button>
                  </Stack>
                </form>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </>
  );
};

export default ProfilePage;
