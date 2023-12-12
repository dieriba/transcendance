import {
  Stack,
  DialogContent,
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
  useGetRestrictionInfoMutation,
  useUnrestrictUserMutation,
} from "../../../../redux/features/groups/group.api.slice";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import {
  setRestrictedUser,
  unrestrictUser,
} from "../../../../redux/features/groups/group.slice";
import { RootState } from "../../../../redux/store";
import {
  BaseChatroomWithUserIdType,
  RestrictedGroupType,
} from "../../../../models/groupChat";
import {
  isFetchBaseQueryError,
  isErrorWithMessage,
} from "../../../../services/helpers";
import RestrictionInfo from "./RestrictionInfo";
import { showSnackBar } from "../../../../redux/features/app/app.slice";
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
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const [restrict, setRestrict] = useState<
    (RestrictedGroupType & { nickname: string }) | undefined
  >(undefined);

  useEffect(() => {
    if (data?.data) {
      dispatch(setRestrictedUser(data.data));
    }
  }, [data, dispatch]);

  const [UnrestrictUser, unrestrictedUserAction] = useUnrestrictUserMutation();
  const [getRestrictionInfo, restrictionInfoAction] =
    useGetRestrictionInfoMutation();

  const restrictedUsers = useAppSelector(
    (state: RootState) => state.groups.restrictedUser
  );

  const handleGetRestrictionInfo = async (
    restriction: BaseChatroomWithUserIdType,
    nickname: string
  ) => {
    try {
      const res = await getRestrictionInfo(restriction).unwrap();
      setRestrict({ ...res.data, nickname });
    } catch (error) {
      console.log(error);

      if (isFetchBaseQueryError(error)) {
        if (
          error.data &&
          typeof error.data === "object" &&
          "message" in error.data
        ) {
          dispatch(
            showSnackBar({
              message: error.data.message as string,
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
      } else if (isErrorWithMessage(error)) {
        dispatch(
          showSnackBar({
            message: error.message,
            severity: "error",
          })
        );
      }
    }
  };

  const handleSubmit = async (id: string) => {
    try {
      const res = await UnrestrictUser({ id, chatroomId }).unwrap();

      dispatch(unrestrictUser({ data: res.data, chatroomId }));

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
                      <Button
                        onClick={() => {
                          handleGetRestrictionInfo(
                            {
                              chatroomId,
                              id: user.user.id,
                            },
                            user.user.nickname
                          );
                        }}
                        disabled={restrictionInfoAction.isLoading}
                        variant="contained"
                        color="inherit"
                      >
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
        {restrict && (
          <RestrictionInfo
            open={restrict ? true : false}
            restrictionInfo={restrict}
            handleClose={() => {
              setRestrict(undefined);
            }}
          />
        )}
      </>
    );
  }
};

export default UnRestrictUser;
