import {
  Stack,
  Box,
  Typography,
  Avatar,
  Divider,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Bell,  Key, Lock, PencilCircle } from "phosphor-react";
import { ReactNode } from "react";
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import { User } from "../../redux/features/user/user.slice";
const Settings = () => {
  const theme = useTheme();
  const {
    profile: { avatar, lastname, firstname },
  } = useAppSelector((state: RootState) => state.user.user) as User;
  interface listData {
    icon: ReactNode;
    title: string;
    onClick: () => void;
  }

  const list: listData[] = [
    {
      icon: <Bell size={20} />,
      title: "Notifications",
      onClick: () => {},
    },
    {
      icon: <Lock size={20} />,
      title: "Privacy",
      onClick: () => {},
    },
    {
      icon: <Key size={20} />,
      title: "Security",
      onClick: () => {},
    },
    {
      icon: <PencilCircle size={20} />,
      title: "Theme",
      //onClick: handleOpenTheme,
      onClick: () => {},
    },
  ];

  const lastIndex = list.length - 1;

  return (
    <Stack direction="row" sx={{ width: "100%" }}>
      <Box
        sx={{
          overflowY: "scroll",
          height: "100vh",
          width: 320,
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background.default,
          boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
        }}
      >
        <Stack p={4} alignItems="center" spacing={4}>
          <Typography variant="h6">Settings</Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title={`${firstname} ${lastname}`}>
              <Avatar
                sx={{ width: "100px", height: "100px" }}
                src={avatar ? avatar : undefined}
                alt={firstname}
              />
            </Tooltip>
          </Stack>
          <Stack width="100%" spacing={2}>
            {list.map(({ icon, title, onClick }: listData, index) => (
              <Stack
                width="100%"
                key={index}
                onClick={onClick}
                sx={{
                  cursor: "pointer",
                  ":hover": {
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: 1.5,
                    color: "white",
                  },
                }}
              >
                <Stack direction="row" p={3} spacing={2} alignItems="center">
                  {icon}
                  <Typography variant="body2">{title}</Typography>
                </Stack>
                {index !== lastIndex && <Divider />}
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
};

export default Settings;
