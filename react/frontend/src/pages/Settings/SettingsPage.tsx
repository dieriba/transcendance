import {
  Stack,
  Box,
  Typography,
  Avatar,
  Divider,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Key, Lock } from "phosphor-react";
import { ReactNode, useState } from "react";
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import { User } from "../../redux/features/user/user.slice";
import Security from "../../components/Settings/security/Security";
const Settings = () => {
  const theme = useTheme();
  const onlyMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  const {
    profile: { avatar, lastname, firstname },
  } = useAppSelector((state: RootState) => state.user.user) as User;
  interface listData {
    icon: ReactNode;
    title: string;
    onClick: () => void;
  }

  const [listOptions, setListOptions] = useState<{
    notification: boolean;
    privacy: boolean;
    security: boolean;
  }>({ notification: false, privacy: false, security: false });

  const list: listData[] = [
    {
      icon: <Lock size={20} />,
      title: "Privacy",
      onClick: () => {},
    },
    {
      icon: <Key size={20} />,
      title: "Security",
      onClick: () => {
        setListOptions((prev) => ({ ...prev, security: true }));
      },
    },
  ];

  return (
    <>
      <Stack mt={5} sx={{ width: "100%" }}>
        <Box
          sx={{
            width: onlyMediumScreen ? "100vw" : "320px",
            height: onlyMediumScreen ? "100%" : "auto",
            backgroundColor:
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background.default,
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
          }}
        >
          <Stack p={4} alignItems="center" spacing={4}>
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
                  <Divider />
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Stack>
      {listOptions.security && (
        <Security
          open={listOptions.security}
          handleClose={() =>
            setListOptions((prev) => ({ ...prev, security: false }))
          }
        />
      )}
    </>
  );
};

export default Settings;
