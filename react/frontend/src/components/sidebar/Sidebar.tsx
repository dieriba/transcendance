import { Tooltip, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Avatar, Box, IconButton, Stack } from "@mui/material";
import { Nav_Buttons } from "../../data/data";
import { SignOut } from "phosphor-react";
import React from "react";
import { matchPath, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { apiSlice } from "../../redux/api/apiSlice";
import { LOGOUT } from "../../redux/type";
import { useDisconnectAllUserMutation, useLogoutMutation } from "../../redux/features/user/user.api.slice";
import { RootState } from "../../redux/store";
import { useLocation } from "react-router-dom";
import { User } from "../../redux/features/user/user.slice";
import { SIDEBAR_WIDTH } from "../../utils/constant";

const Sidebar = () => {
  const { pathname } = useLocation();
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const user = useAppSelector((state: RootState) => state.user.user);
  const [disconnectAllInstanceOfMe] = useDisconnectAllUserMutation();

  const onlyMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  const nickname = (user as User).nickname;
  const avatar = (user as User).profile.avatar as string | undefined;

  const handleNavigate = (path: string) => {
    navigate(path);
  };
  const [loggingOut] = useLogoutMutation();
  const logoutUser = async () => {
    try {
      await loggingOut().unwrap();
      await disconnectAllInstanceOfMe().unwrap();
      dispatch(apiSlice.util.resetApiState());
      dispatch({ type: LOGOUT });
      // eslint-disable-next-line no-self-assign
      window.location = window.location;
    } catch (error) {
      dispatch(apiSlice.util.resetApiState());
      dispatch({ type: LOGOUT });
      // eslint-disable-next-line no-self-assign
      window.location = window.location;
    }
  };

  return (
    <>
      <Box
        p={2}
        sx={{
          backgroundColor: theme.palette.background.paper,
          boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
          height: "100%",
          width: SIDEBAR_WIDTH,
        }}
        display={onlyMediumScreen ? "none" : "block"}
      >
        <Stack
          sx={{
            width: "100%",
            alignItems: "center",
            height: "100%",
            justifyContent: "space-between",
          }}
        >
          <Stack
            spacing={1}
            sx={{ width: "max-content", alignItems: "center" }}
          >
            {Nav_Buttons.map((button, index) =>
              matchPath(button.path, pathname) ? (
                <Box
                  p={1}
                  sx={{
                    borderRadius: 1.5,
                    backgroundColor: theme.palette.primary.main,
                  }}
                  key={index}
                >
                  <IconButton
                    key={index}
                    sx={{ width: "max-content", color: "#fff" }}
                  >
                    {button.icon}
                  </IconButton>
                </Box>
              ) : (
                <Box
                  p={1}
                  sx={{
                    borderRadius: 1.5,
                  }}
                  key={index}
                  onClick={() => handleNavigate(button.path)}
                >
                  <IconButton sx={{ width: "max-content" }} key={index}>
                    {button.icon}
                  </IconButton>
                </Box>
              )
            )}
          </Stack>
          <Stack alignItems="center" spacing={2}>
            <IconButton onClick={() => logoutUser()}>
              <SignOut />
            </IconButton>
            <Tooltip title={nickname}>
              <Avatar
                id="avatar-menu"
                aria-controls={open ? "demo-positioned-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
                sx={{ cursor: "pointer", width: "50px", height: "50px" }}
                src={avatar}
              />
            </Tooltip>
          </Stack>
        </Stack>
      </Box>
    </>
  );
};

export default Sidebar;
