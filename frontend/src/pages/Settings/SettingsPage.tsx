import { faker } from "@faker-js/faker";
import {
  Stack,
  Box,
  IconButton,
  Typography,
  Avatar,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Bell, CaretLeft, Key, Lock, PencilCircle } from "phosphor-react";
import { ReactNode } from "react";
const Settings = () => {
  const theme = useTheme();

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
        <Stack p={4} spacing={4}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton>
              <CaretLeft size={24} color={"#4B4B4B"} />
            </IconButton>
            <Typography variant="h6">Settings</Typography>
          </Stack>
          <Stack direction="row" spacing={3}>
            <Avatar src={faker.image.avatar()} alt={faker.person.fullName()} />
            <Stack>
              <Typography variant="subtitle2">
                {faker.name.fullName()}
              </Typography>
              <Typography variant="subtitle2">
                {faker.random.words()}
              </Typography>
            </Stack>
          </Stack>
          <Stack spacing={2}>
            {list.map(({ icon, title, onClick }: listData, index) => (
              <Stack
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
