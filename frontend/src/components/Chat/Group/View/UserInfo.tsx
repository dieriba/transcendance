import { Avatar, Stack, Typography } from "@mui/material";
import BadgeAvatar from "../../../Badge/BadgeAvatar";
import { ReactNode } from "react";

interface UserInfoProps {
  online: boolean;
  nickname: string;
  avatar: string | undefined;
  children: ReactNode;
  //handleUser: (id:string, nickname:string, role:string) => void;
}

const UserInfo = ({ online, nickname, avatar, children }: UserInfoProps) => {
  return (
    <Stack width="100%" alignItems="flex-start">
      <Stack
        direction="row"
        height="100%"
        spacing={1}
        alignItems="center"
        width="100%"
      >
        {online ? (
          <BadgeAvatar>
            <Avatar sx={{ height: "2rem", width: "2rem" }} src={avatar} />
          </BadgeAvatar>
        ) : (
          <Avatar sx={{ height: "2rem", width: "2rem" }} src={avatar} />
        )}
        <Typography>{nickname}</Typography>
      </Stack>
      <Stack pt={1} pb={1} direction="row">
        {children}
      </Stack>
    </Stack>
  );
};

export default UserInfo;
