import {
  Box,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import { useEffect, useState } from "react";
import { useGetAllGroupUserQuery } from "../../../../redux/features/groups/group.api.slice";
import { setGroupMembersAndRole } from "../../../../redux/features/groups/groupSlice";
import { useAppSelector, useAppDispatch } from "../../../../redux/hooks";
import { RootState } from "../../../../redux/store";
import { ChatRoleType } from "../../../../models/type-enum/typesEnum";
import UserInfo from "./UserInfo";
import AdminAction from "./AdminAction";
import ModeratorAction from "./ModeratorAction";
import { User } from "../../../../redux/features/auth/auth.slice";
import SetAsAdmin from "./AdminView/SetAsAdmin";
import SetNewRole from "./AdminView/SetNewRole";
import UserAction from "./UserAction";

const View = () => {
  const chatroomId = useAppSelector(
    (state: RootState) => state.groups.currentGroupChatroomId
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

  const { role, admin, chatAdmin, regularUser } = useAppSelector(
    (state: RootState) => state.groups
  );
  const userData = useAppSelector(
    (state: RootState) => state.user.user
  ) as User;

  const [user, setUser] = useState<{
    id: string;
    nickname: string;
    role?: ChatRoleType;
  }>({
    id: "",
    nickname: "",
  });

  const [open, setOpen] = useState<{ admin: boolean; role: boolean }>({
    admin: false,
    role: false,
  });

  const handleNewAdmin = ({
    id,
    nickname,
  }: {
    id: string;
    nickname: string;
  }) => {
    setUser({ id, nickname });
    setOpen((prev) => {
      return { ...prev, admin: true };
    });
  };

  const handleChangeRole = ({
    id,
    nickname,
    role,
  }: {
    id: string;
    nickname: string;
    role: ChatRoleType;
  }) => {
    setUser({ id, nickname, role });
    setOpen((prev) => {
      return { ...prev, role: true };
    });
  };

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
    return (
      <>
        <Stack spacing={1} height="100%" width="100%" alignSelf="flex-start">
          <Typography variant="subtitle2" fontWeight={600}>
            Admin
          </Typography>
          <Divider />

          <UserInfo
            avatar={admin?.user.profile?.avatar}
            nickname={admin?.user.nickname as string}
            online={admin?.user.status === "ONLINE"}
          >
            <AdminAction
              nickname={admin?.user.nickname as string}
              role={role as ChatRoleType}
            />
          </UserInfo>

          <Divider />
          <Typography variant="subtitle2" fontWeight={600}>
            Moderator
          </Typography>
          <Divider />
          <Stack maxHeight="40%" sx={{ overflow: "scroll" }}>
            {chatAdmin.length === 0 ? (
              <Typography>No Moderator</Typography>
            ) : (
              chatAdmin.map(
                ({ user: { nickname, status, profile, id } }, index) => {
                  return (
                    <UserInfo
                      key={index}
                      nickname={nickname}
                      online={status === "ONLINE"}
                      avatar={profile?.avatar}
                    >
                      <ModeratorAction
                        handleChangeRole={handleChangeRole}
                        handleNewAdmin={handleNewAdmin}
                        role={role as ChatRoleType}
                        id={id}
                        nickname={nickname}
                        me={nickname === userData.nickname}
                      />
                    </UserInfo>
                  );
                }
              )
            )}
          </Stack>
          <Divider />
          <Typography variant="subtitle2" fontWeight={600}>
            Users
          </Typography>
          <Divider />
          <Stack maxHeight="40%" sx={{ overflow: "scroll" }}>
            {regularUser.length === 0 ? (
              <Typography>No User</Typography>
            ) : (
              regularUser.map(
                ({ user: { nickname, status, profile, id } }, index) => {
                  return (
                    <UserInfo
                      key={index}
                      nickname={nickname}
                      online={status === "ONLINE"}
                      avatar={profile?.avatar}
                    >
                      <UserAction
                        handleChangeRole={handleChangeRole}
                        handleNewAdmin={handleNewAdmin}
                        role={role as ChatRoleType}
                        id={id}
                        nickname={nickname}
                        me={nickname === userData.nickname}
                      />
                    </UserInfo>
                  );
                }
              )
            )}
          </Stack>
        </Stack>
        {open.admin && (
          <SetAsAdmin
            open={open.admin}
            handleClose={() =>
              setOpen((prev) => {
                return { ...prev, admin: false };
              })
            }
            nickname={user.nickname}
            id={user.id}
          />
        )}
        {open.role && (
          <SetNewRole
            open={open.role}
            handleClose={() =>
              setOpen((prev) => {
                return { ...prev, role: false };
              })
            }
            nickname={user.nickname}
            id={user.id}
            role={user.role as ChatRoleType}
          />
        )}
      </>
    );
  }
};

export default View;
