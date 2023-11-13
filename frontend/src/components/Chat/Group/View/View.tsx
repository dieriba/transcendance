import {
  Box,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import { useEffect, useMemo, useState } from "react";
import { useGetAllGroupUserQuery } from "../../../../redux/features/groups/group.api.slice";
import { setGroupMembersAndRole } from "../../../../redux/features/groups/groupSlice";
import { useAppSelector, useAppDispatch } from "../../../../redux/hooks";
import { RootState } from "../../../../redux/store";
import { ChatRoleType } from "../../../../models/type-enum/typesEnum";
import UserInfo from "./UserInfo";
import AdminAction from "./AdminAction";
import ModeratorAction from "./ModeratorAction";
import SetAsAdmin from "./AdminView/SetAsAdmin";
import SetNewRole from "./AdminView/SetNewRole";
import UserAction from "./UserAction";
import RestrictUser from "./RestrictUser";

const View = () => {
  const {
    groups: { admin, currentGroupChatroomId, chatAdmin, regularUser, role },
    user: { user },
  } = useAppSelector((state: RootState) => state);

  const { data, isLoading, isError } = useGetAllGroupUserQuery(
    currentGroupChatroomId as string,
    { refetchOnMountOrArgChange: true }
  );
  const dispatch = useAppDispatch();
  const memoizedChatAdmin = useMemo(() => chatAdmin, [chatAdmin]);
  const memoizedRegularUser = useMemo(() => regularUser, [regularUser]);
  useEffect(() => {
    if (data?.data) {
      dispatch(setGroupMembersAndRole(data.data));

      return () => {};
    }
  }, [data, dispatch]);

  const [userData, setUserData] = useState<{
    id: string;
    nickname: string;
    role?: ChatRoleType;
  }>({
    id: "",
    nickname: "",
  });

  const [open, setOpen] = useState<{
    admin: boolean;
    role: boolean;
    restriction: boolean;
  }>({
    admin: false,
    role: false,
    restriction: false,
  });

  const handleNewAdmin = ({
    id,
    nickname,
  }: {
    id: string;
    nickname: string;
  }) => {
    setUserData({ id, nickname });
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
    setUserData({ id, nickname, role });
    setOpen((prev) => {
      return { ...prev, role: true };
    });
  };

  const handleRestriction = ({
    id,
    nickname,
  }: {
    id: string;
    nickname: string;
  }) => {
    setUserData({ id, nickname });
    setOpen((prev) => {
      return { ...prev, restriction: true };
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
              memoizedChatAdmin.map(
                ({ user: { nickname, status, profile, id } }, index) => {
                  return (
                    <UserInfo
                      key={index}
                      nickname={nickname}
                      online={status === "ONLINE"}
                      avatar={profile?.avatar}
                    >
                      <ModeratorAction
                        handleRestriction={handleRestriction}
                        handleChangeRole={handleChangeRole}
                        handleNewAdmin={handleNewAdmin}
                        role={role as ChatRoleType}
                        id={id}
                        nickname={nickname}
                        me={nickname === user?.nickname}
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
              memoizedRegularUser.map(
                ({ user: { nickname, status, profile, id } }, index) => {
                  return (
                    <UserInfo
                      key={index}
                      nickname={nickname}
                      online={status === "ONLINE"}
                      avatar={profile?.avatar}
                    >
                      <UserAction
                        handleRestrict={handleRestriction}
                        handleChangeRole={handleChangeRole}
                        handleNewAdmin={handleNewAdmin}
                        role={role as ChatRoleType}
                        id={id}
                        nickname={nickname}
                        me={nickname === user?.nickname}
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
            nickname={userData.nickname}
            id={userData.id}
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
            nickname={userData.nickname}
            id={userData.id}
            role={userData.role as ChatRoleType}
          />
        )}
        {open.restriction && (
          <RestrictUser
            role={role as ChatRoleType}
            open={open.restriction}
            handleClose={() =>
              setOpen((prev) => {
                return { ...prev, restriction: false };
              })
            }
            nickname={userData.nickname}
            id={userData.id}
          />
        )}
      </>
    );
  }
};

export default View;
