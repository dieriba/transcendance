import {
  Stack,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  ButtonGroup,
  Typography,
} from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTheme } from "@mui/material/styles";
import {
  RestrictUserFormSchema,
  RestrictUserType,
} from "../../../../models/groupChat";
import CustomTextField from "../../../CustomTextField/CustomTextField";
import DialogI from "../../../Dialog/DialogI";
import { SocketServerErrorResponse } from "../../../../services/type";
import {
  ChatRoleType,
  DurationUnit,
  Restriction,
  durationUnit,
  restrictionType,
} from "../../../../models/type-enum/typesEnum";
import RHFTextArea from "../../../controlled-components/RHFTextArea";
import {
  BAN_LIFE_VALUE,
  BAN_MAX_DAYS,
  KICK_MAX_DAYS,
  KICK_MAX_HOURS,
  KICK_MAX_MIN,
  MUTE_MAX_DAYS,
  MUTE_MAX_HOURS,
  MUTE_MAX_MIN,
} from "../../../../../shared/restriction.constant";
import { useRestrictUserMutation } from "../../../../redux/features/groups/group.api.slice";
import { useAppDispatch } from "../../../../redux/hooks";
import { addRestrictedUser } from "../../../../redux/features/groups/group.slice";
import { showSnackBar } from "../../../../redux/features/app/app.slice";
interface RestrictUserProps {
  open: boolean;
  nickname: string;
  chatroomId: string;
  handleClose: () => void;
  role: ChatRoleType;
  id: string;
}

const RestrictUser = ({
  open,
  handleClose,
  nickname,
  id,
  role,
  chatroomId,
}: RestrictUserProps) => {
  const { control, handleSubmit, watch, setValue } = useForm<RestrictUserType>({
    resolver: zodResolver(RestrictUserFormSchema),
  });

  const restrictionWatcher = watch("restriction");

  const [restrictUser, { isLoading }] = useRestrictUserMutation();

  const theme = useTheme();
  const dispatch = useAppDispatch();
  const onSubmit = async (data: RestrictUserType) => {
    try {
      if (data.duration === undefined) data.duration = 1;
      else data.duration = Number(data.duration);

      data.id = id;
      data.chatroomId = chatroomId;
      const res = await restrictUser(data).unwrap();

      dispatch(
        addRestrictedUser({ data: res.data, chatroomId: data.chatroomId })
      );
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

  return (
    <>
      <DialogI maxWidth="sm" open={open} handleClose={handleClose}>
        <DialogTitle
          sx={{ backgroundColor: theme.palette.background.paper }}
        >{`Restrict ${nickname}`}</DialogTitle>
        <DialogContent sx={{ backgroundColor: theme.palette.background.paper }}>
          <Stack p={2}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack
                sx={{ backgroundColor: theme.palette.background.paper }}
                spacing={2}
              >
                <Stack sx={{ backgroundColor: theme.palette.background.paper }}>
                  <Typography variant="caption">Restriction: </Typography>
                  <Controller
                    name="restriction"
                    control={control}
                    defaultValue="MUTED"
                    render={({ field }) => (
                      <ButtonGroup fullWidth>
                        {restrictionType.map((level) => (
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
                              if (level === "BANNED")
                                setValue("durationUnit", "DAYS");
                            }}
                          >
                            {level}
                          </Button>
                        ))}
                      </ButtonGroup>
                    )}
                  />
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="caption">Duration Unit:</Typography>
                  <Controller
                    name="durationUnit"
                    control={control}
                    defaultValue="MIN"
                    render={({ field }) => (
                      <ButtonGroup fullWidth>
                        {durationUnit.map((level) => (
                          <Button
                            size="large"
                            key={level}
                            disabled={
                              level !== DurationUnit.DAYS &&
                              restrictionWatcher === "BANNED"
                            }
                            sx={{
                              borderColor:
                                level === field.value
                                  ? theme.palette.primary.main
                                  : "",
                            }}
                            onClick={() => {
                              field.onChange(level);
                            }}
                          >
                            {level}
                          </Button>
                        ))}
                      </ButtonGroup>
                    )}
                  />
                  <Stack>
                    {restrictionWatcher === Restriction.KICKED ? (
                      <>
                        <Typography color={"gray"} variant="caption">
                          {`User can be kicked at most ${KICK_MAX_MIN} minutes`}
                        </Typography>
                        <Typography color={"gray"} variant="caption">
                          {`User can be kicked at most ${KICK_MAX_HOURS} hours`}
                        </Typography>
                        <Typography color={"gray"} variant="caption">
                          {`User can be kicked at most ${KICK_MAX_DAYS} days`}
                        </Typography>
                      </>
                    ) : restrictionWatcher === Restriction.BANNED ? (
                      <>
                        <Typography color={"gray"} variant="caption">
                          {`User can be banned ${BAN_MAX_DAYS} days or for life`}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography color={"gray"} variant="caption">
                          {`User can be muted at most ${MUTE_MAX_MIN} minutes`}
                        </Typography>
                        <Typography color={"gray"} variant="caption">
                          {`User can be muted at most ${MUTE_MAX_HOURS} hours`}
                        </Typography>
                        <Typography color={"gray"} variant="caption">
                          {`User can be muted at most ${MUTE_MAX_DAYS} days`}
                        </Typography>
                      </>
                    )}
                  </Stack>
                  {role === "DIERIBA" && (
                    <>
                      <Button
                        fullWidth
                        color="inherit"
                        variant="contained"
                        onClick={() => {
                          setValue("restriction", "BANNED");
                          setValue("durationUnit", "DAYS");
                          setValue("duration", BAN_LIFE_VALUE);
                        }}
                      >{`Ban life ${nickname}`}</Button>
                    </>
                  )}
                </Stack>

                <Controller
                  name="duration"
                  control={control}
                  render={({
                    field: { value, onChange },
                    fieldState: { error },
                  }) => (
                    <Stack>
                      <Typography variant="caption">Duration:</Typography>
                      <CustomTextField error={error} message={error?.message}>
                        <TextField
                          error={!!error}
                          onChange={onChange}
                          value={value ?? 1}
                          type="text"
                          sx={{
                            "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                              {
                                display: "none",
                              },
                            "& input[type=text]": {
                              MozAppearance: "textfield",
                            },
                          }}
                        />
                      </CustomTextField>
                    </Stack>
                  )}
                />

                <RHFTextArea
                  rows={4}
                  label="reason"
                  name="reason"
                  control={control}
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
                >
                  {`Restrict ${nickname}`}
                </Button>
              </Stack>
            </form>
          </Stack>
        </DialogContent>
      </DialogI>
    </>
  );
};

export default RestrictUser;
