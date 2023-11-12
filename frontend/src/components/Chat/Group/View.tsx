import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import AdminView from "./AdminView/AdminView";
import ModeratorView from "./ModeratorView/ModeratorView";
import UserView from "./UserView/UserView";
import { useEffect } from "react";
import { useGetAllGroupUserQuery } from "../../../redux/features/groups/group.api.slice";
import { setGroupMembersAndRole } from "../../../redux/features/groups/groupSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { RootState } from "../../../redux/store";
import { UserGroupType } from "../../../models/groupChat";

export interface ViewProps {
  users: UserGroupType[];
}

const View = () => {
  const chatroomId = useAppSelector(
    (state) => state.groups.currentGroupChatroomId
  );

  const { data, isLoading, isError } = useGetAllGroupUserQuery(
    chatroomId as string,
    { refetchOnMountOrArgChange: true }
  );
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (data?.data) {
      dispatch(setGroupMembersAndRole(data.data));

      return () => {};
    }
  }, [data, dispatch]);

  const { role } = useAppSelector((state: RootState) => state.groups);

  if (isLoading) {
    return (
      <Box width="320px">
        <Stack alignItems="center" height="100%" justifyContent="center">
          <CircularProgress size={100} />
        </Stack>
      </Box>
    );
  } else if (isError || !data) {
    return (
      <Box width="320px">
        <Stack
          alignItems="center"
          height="100%"
          pt={25}
          justifyContent="center"
        >
          <Typography>An error has occured</Typography>
        </Stack>
      </Box>
    );
  } else {
    console.log({ role });

    console.log({ data: data.data });

    if (role === "DIERIBA") {
      return <AdminView />;
    } else if (role === "CHAT_ADMIN") {
      return <ModeratorView />;
    } else {
      return <UserView />;
    }
  }
};

export default View;
