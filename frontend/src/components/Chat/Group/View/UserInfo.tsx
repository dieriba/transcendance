import { Avatar, Box, Button, Stack, Tooltip, Typography } from "@mui/material";
import BadgeAvatar from "../../../Badge/BadgeAvatar";
import { ReactNode } from "react";
import { RestrictedGroupType } from "../../../../models/groupChat";

interface UserInfoProps {
  online: boolean;
  nickname: string;
  avatar: string | undefined;
  children: ReactNode;
  restrictedUser?: RestrictedGroupType | undefined;
  //handleUser: (id:string, nickname:string, role:string) => void;
}

const UserInfo = ({
  online,
  nickname,
  avatar,
  children,
  restrictedUser,
}: UserInfoProps) => {
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
        {restrictedUser && (
          <Box textAlign="center">
            <Button
              component="label"
              variant="contained"
              size="small"
              disableElevation
              color="inherit"
            >
              <Tooltip
                placement="top"
                title={`Banned by ${restrictedUser.admin.user.nickname}`}
              >
                <Typography variant="caption">
                  {restrictedUser.restriction}
                </Typography>
              </Tooltip>
            </Button>
          </Box>
        )}
      </Stack>
      <Stack pt={1} pb={1} direction="row">
        {children}
      </Stack>
    </Stack>
  );
};

export default UserInfo;
