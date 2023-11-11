import { Typography, Divider } from "@mui/material";
import Stack from "@mui/material/Stack";
import Moderator from "./Moderator";
import User from "./User";
import Admin from "./Admin";
import { useAppSelector } from "../../../../redux/hooks";
import { RootState } from "../../../../redux/store";

const UserView = () => {
  const myNickname = useAppSelector(
    (state: RootState) => state.user.user?.nickname
  );
  const { admin, chatAdmin, regularUser } = useAppSelector(
    (state: RootState) => state.groups
  );
  return (
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
          chatAdmin.map((moderator) => {
            return <Moderator nickname={moderator.user.nickname} />;
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
          regularUser.map((moderator) => {
            return (
              <User
                myNickname={myNickname as string}
                nickname={moderator.user.nickname}
              />
            );
          })
        )}
      </Stack>
    </Stack>
  );
};

export default UserView;
