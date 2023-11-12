import { Typography, Divider } from "@mui/material";
import Stack from "@mui/material/Stack";
import Moderator from "./Moderator";
import User from "./User";
import Admin from "./Admin";
import { useAppSelector } from "../../../../redux/hooks";
import { RootState } from "../../../../redux/store";
import { useState } from "react";
import SetAsAdmin from "./SetAsAdmin";
import SetAsModerator from "./SetNewRole";
import { ChatRoleType } from "../../../../models/type-enum/typesEnum";

const AdminView = () => {
  const { admin, chatAdmin, regularUser } = useAppSelector(
    (state: RootState) => state.groups
  );

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

  return (
    <>
      <Stack spacing={1} height="100%" width="100%" alignSelf="flex-start">
        <Typography variant="subtitle2" fontWeight={600}>
          Admin
        </Typography>
        <Divider />

        <Admin nickname={admin?.user.nickname as string} />
        <Divider />
        <Typography variant="subtitle2" fontWeight={600}>
          Moderator
        </Typography>
        <Divider />
        <Stack maxHeight="40%" sx={{ overflow: "scroll" }}>
          {chatAdmin.length === 0 ? (
            <Typography>No Moderator</Typography>
          ) : (
            chatAdmin.map((moderator, index) => {
              return (
                <Moderator
                  handleNewAdmin={handleNewAdmin}
                  handleChangeRole={handleChangeRole}
                  key={index}
                  id={moderator.user.id}
                  nickname={moderator.user.nickname}
                />
              );
            })
          )}
        </Stack>
        <Divider />
        <Typography variant="subtitle2" fontWeight={600}>
          Users
        </Typography>
        <Divider />
        <Stack maxHeight="40%" sx={{ overflow: "scroll" }}>
          {regularUser.length === 0 ? (
            <Typography>No Moderator</Typography>
          ) : (
            regularUser.map((moderator, index) => {
              return (
                <User
                  key={index}
                  id={moderator.user.id}
                  handleNewAdmin={handleNewAdmin}
                  handleChangeRole={handleChangeRole}
                  nickname={moderator.user.nickname}
                />
              );
            })
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
        <SetAsModerator
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
};

export default AdminView;
