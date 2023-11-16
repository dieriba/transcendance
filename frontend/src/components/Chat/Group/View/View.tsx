import {
  Box,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import { useEffect, useMemo, useState } from "react";
import { useGetAllGroupUserQuery } from "../../../../redux/features/groups/group.api.slice";
import {
  setGroupMembersAndRole,
  setOfflineUser,
  setOnlineUser,
} from "../../../../redux/features/groups/group.slice";
import { useAppSelector, useAppDispatch } from "../../../../redux/hooks";
import { RootState } from "../../../../redux/store";
import { ChatRoleType, STATUS } from "../../../../models/type-enum/typesEnum";
import UserInfo from "./UserInfo";
import AdminAction from "./AdminAction";
import ModeratorAction from "./ModeratorAction";
import SetAsAdmin from "./AdminView/SetAsAdmin";
import SetNewRole from "./AdminView/SetNewRole";
import UserAction from "./UserAction";
import RestrictUser from "./RestrictUser";
import { connectSocket, socket } from "../../../../utils/getSocket";
import { GeneralEvent } from "../../../../../../shared/socket.event";
import { SocketServerSucessResponse } from "../../../../services/type";
import UnRestrictUser from "./UnrestrictUser";
import { BaseFriendType } from "../../../../models/FriendsSchema";
import KickUser from "./KickUser";

const View = () => {
  const { admin, currentGroupChatroomId, chatAdmin, regularUser, role } =
    useAppSelector((state: RootState) => state.groups);
  const { user } = useAppSelector((state: RootState) => state.user);

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

      connectSocket();

      socket.on(
        GeneralEvent.USER_LOGGED_OUT,
        (data: SocketServerSucessResponse & { data: BaseFriendType }) => {
          dispatch(setOfflineUser(data.data));
        }
      );

      socket.on(
        GeneralEvent.USER_LOGGED_IN,
        (data: SocketServerSucessResponse & { data: BaseFriendType }) => {
          dispatch(setOnlineUser(data.data));
        }
      );

      return () => {
        socket.off(GeneralEvent.USER_LOGGED_IN);
        socket.off(GeneralEvent.USER_LOGGED_OUT);
      };
    }
  }, [data, dispatch]);

  const [userData, setUserData] = useState<{
    id: string;
    nickname: string;
    role: ChatRoleType;
    chatroomId: string;
  }>({
    id: "",
    nickname: "",
    chatroomId: currentGroupChatroomId as string,
    role: role as ChatRoleType,
  });

  const [open, setOpen] = useState<{
    admin: boolean;
    role: boolean;
    restriction: boolean;
    unrestriction: boolean;
    kick: boolean;
  }>({
    admin: false,
    role: false,
    restriction: false,
    unrestriction: false,
    kick: false,
  });

  const handleNewAdmin = ({
    id,
    nickname,
  }: {
    id: string;
    nickname: string;
  }) => {
    setUserData((prev) => ({ ...prev, id, nickname }));
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
    setUserData((prev) => ({ ...prev, id, nickname, role }));
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
    setUserData((prev) => ({ ...prev, id, nickname }));
    setOpen((prev) => {
      return { ...prev, restriction: true };
    });
  };

  const handleUnrestriction = ({ nickname }: { nickname: string }) => {
    setUserData((prev) => ({ ...prev, nickname }));
    setOpen((prev) => {
      return { ...prev, unrestriction: true };
    });
  };

  const handleKickUser = (data: { id: string; nickname: string }) => {
    setUserData((prev) => ({ ...prev, ...data }));
    setOpen((prev) => ({ ...prev, kick: true }));
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
            avatar={
              admin?.user.profile?.avatar
                ? admin?.user.profile?.avatar
                : undefined
            }
            nickname={admin?.user.nickname as string}
            online={admin?.user.status === STATUS.ONLINE}
          >
            <AdminAction
              handleUnrestriction={handleUnrestriction}
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
                      online={status === STATUS.ONLINE}
                      avatar={profile?.avatar ? profile.avatar : undefined}
                    >
                      <ModeratorAction
                        handleKickUser={handleKickUser}
                        handleUnrestriction={handleUnrestriction}
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
                (
                  { user: { nickname, status, profile, id, restrictedGroups } },
                  index
                ) => {
                  return (
                    <UserInfo
                      key={index}
                      nickname={nickname}
                      online={status === STATUS.ONLINE}
                      avatar={profile?.avatar ? profile.avatar : undefined}
                      restrictedUser={
                        restrictedGroups.length == 0
                          ? undefined
                          : restrictedGroups[0]
                      }
                    >
                      <UserAction
                        handleKickUser={handleKickUser}
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
            chatroomId={currentGroupChatroomId as string}
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
        {open.unrestriction && (
          <UnRestrictUser
            chatroomId={currentGroupChatroomId as string}
            role={role as ChatRoleType}
            open={open.unrestriction}
            handleClose={() =>
              setOpen((prev) => {
                return { ...prev, unrestriction: false };
              })
            }
            nickname={userData.nickname}
          />
        )}
        {open.kick && (
          <KickUser
            open={open.kick}
            chatroomId={currentGroupChatroomId as string}
            handleClose={() => setOpen((prev) => ({ ...prev, kick: false }))}
            id={userData.id}
            nickname={userData.nickname}
          />
        )}
      </>
    );
  }
};

export default View;
