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
  setCurrentUser,
  setGroupMembersAndRole,
  updateUserStatus,
} from "../../../../redux/features/groups/group.slice";
import { useAppSelector, useAppDispatch } from "../../../../redux/hooks";
import { RootState } from "../../../../redux/store";
import {
  ChatRoleType,
  ROLE,
  STATUS,
} from "../../../../models/type-enum/typesEnum";
import UserInfo from "./UserInfo";
import AdminAction from "./AdminAction";
import ModeratorAction from "./ModeratorAction";
import SetAsAdmin from "./AdminView/SetAsAdmin";
import SetNewRole from "./AdminView/SetNewRole";
import UserAction from "./UserAction";
import RestrictUser from "./RestrictUser";
import { connectSocket, socket } from "../../../../utils/getSocket";
import { GeneralEvent } from "../../../../../shared/socket.event";
import { SocketServerSucessResponse } from "../../../../services/type";
import UnRestrictUser from "./UnrestrictUser";
import KickUser from "./KickUser";
import GameInvitation from "../../../game-invitation/GameInvitation";
import { ChatroomGroupType } from "../../../../models/groupChat";
import UserProfileGroup from "../../../Profile/UserProfileGroup";
import { UserUpdateStatusType } from "../../../../models/login/UserSchema";
import { CHATBAR_WIDTH } from "../../../../utils/constant";

export type UserData = {
  id: string;
  nickname: string;
  role: ChatRoleType;
  chatroomId: string;
};
export type Open = {
  admin: boolean;
  role: boolean;
  restriction: boolean;
  unrestriction: boolean;
  kick: boolean;
  gameInvitation: boolean;
  details: boolean;
};

const View = () => {
  const {
    admin,
    currentGroupChatroomId,
    chatAdmin,
    regularUser,
    role,
    currentChatroom,
  } = useAppSelector((state: RootState) => state.groups);
  const { user } = useAppSelector((state: RootState) => state.user);
  const { type } = currentChatroom as ChatroomGroupType;
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
        GeneralEvent.USER_UPDATE_STATUS,
        (data: SocketServerSucessResponse & { data: UserUpdateStatusType }) => {
          dispatch(updateUserStatus(data.data));
        }
      );

      return () => {
        socket.off(GeneralEvent.USER_UPDATE_STATUS);
      };
    }
  }, [data, dispatch]);

  const [userData, setUserData] = useState<UserData>({
    id: "",
    nickname: "",
    chatroomId: currentGroupChatroomId as string,
    role: role as ChatRoleType,
  });

  const [open, setOpen] = useState<Open>({
    admin: false,
    role: false,
    restriction: false,
    unrestriction: false,
    kick: false,
    gameInvitation: false,
    details: false,
  });

  const handleAction = (userData: Partial<UserData>, open: Partial<Open>) => {
    setOpen((prev) => ({ ...prev, ...open }));
    if (!open.details) {
      setUserData((prev) => ({ ...prev, ...userData }));
      return;
    }
    dispatch(
      setCurrentUser({
        id: userData.id as string,
        role: userData.role as ChatRoleType,
      })
    );
  };

  if (isLoading) {
    return (
      <Box width={`${CHATBAR_WIDTH}px`}>
        <Stack alignItems="center" height="100%" justifyContent="center">
          <CircularProgress size={100} />
        </Stack>
      </Box>
    );
  } else if (isError || !data) {
    return (
      <Box width={`${CHATBAR_WIDTH}px`}>
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
              type={type}
              handleAction={handleAction}
              nickname={admin?.user.nickname as string}
              role={role as ChatRoleType}
              userRole={ROLE.DIERIBA}
              id={admin?.user.id as string}
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
                        handleAction={handleAction}
                        role={role as ChatRoleType}
                        userRole={ROLE.CHAT_ADMIN}
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
                        handleAction={handleAction}
                        role={role as ChatRoleType}
                        userRole={ROLE.REGULAR_USER}
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
        {open.gameInvitation && (
          <GameInvitation
            open={open.gameInvitation}
            handleClose={() =>
              setOpen((prev) => ({ ...prev, gameInvitation: false }))
            }
            id={userData.id}
            nickname={userData.nickname}
          />
        )}
        {open.details && (
          <UserProfileGroup
            openDialog={open.details}
            handleClose={() => setOpen((prev) => ({ ...prev, details: false }))}
          />
        )}
      </>
    );
  }
};

export default View;
