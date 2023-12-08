import { Box, Button, Stack, Tooltip, Typography } from "@mui/material";
import { ReactNode } from "react";
import { RestrictedGroupType } from "../../../../models/groupChat";
import GetAvatar from "../../../Badge/GetAvatar";
import { StatusType } from "../../../../models/type-enum/typesEnum";

interface UserInfoProps {
  nickname: string;
  avatar: string | undefined;
  children: ReactNode;
  restrictedUser?: RestrictedGroupType | undefined;
  status: StatusType | undefined;
}

const UserInfo = ({
  nickname,
  avatar,
  children,
  restrictedUser,
  status,
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
        <GetAvatar status={status} src={avatar} height="2rem" width="2rem" />
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
