import {
  AppBar,
  Box,
  CssBaseline,
  Icon,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { List, SignOut } from "phosphor-react";
import { useState } from "react";
import { Nav_Buttons } from "../../data/data";
import { useAppDispatch } from "../../redux/hooks";
import { apiSlice } from "../../redux/api/apiSlice";
import {
  useDisconnectAllUserMutation,
  useLogoutMutation,
} from "../../redux/features/user/user.api.slice";
import { LOGOUT } from "../../redux/type";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
const MobileSidebar = () => {
  const dispatch = useAppDispatch();
  const [loggingOut, loggintOutMutationData] = useLogoutMutation();
  const [disconnectAllInstanceOfMe] = useDisconnectAllUserMutation();
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const logoutUser = async () => {
    try {
      await loggingOut().unwrap();
      await disconnectAllInstanceOfMe().unwrap();
      dispatch(apiSlice.util.resetApiState());
      dispatch({ type: LOGOUT });
      // eslint-disable-next-line no-self-assign
      window.location = window.location;
    } catch (error) {
      console.log({ error });
      console.log({ loggingMutation: loggintOutMutationData.error });

      dispatch(apiSlice.util.resetApiState());
      dispatch({ type: LOGOUT });
      // eslint-disable-next-line no-self-assign
      window.location = window.location;
    }
  };
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleCloseNavMenu();
  };

  return (
    <>
      <CssBaseline />

      <AppBar position="sticky">
        <Box sx={{ display: { xs: "block", md: "none" } }}>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            color="inherit"
          >
            <List />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{
              display: { xs: "block", md: "none" },
            }}
          >
            {Nav_Buttons.map(({ path, icon, name }, index) =>
              matchPath(path, pathname) ? (
                <Stack direction={"row"} key={index} spacing={2}>
                  <MenuItem
                    sx={{
                      width: "200px",
                      display: "flex",
                      justifyContent: "space-between",
                      backgroundColor: "#000000",
                    }}
                    onClick={handleCloseNavMenu}
                  >
                    <Icon sx={{ width: "50px" }}>{icon}</Icon>
                    <Typography textAlign="center">{name}</Typography>
                  </MenuItem>
                </Stack>
              ) : (
                <Stack key={index} direction={"row"} spacing={2}>
                  <MenuItem
                    sx={{
                      width: "200px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                    key={name}
                    onClick={() => {
                      handleNavigate(path);
                    }}
                  >
                    <Icon sx={{ width: "50px" }}>{icon}</Icon>
                    <Typography textAlign="center">{name}</Typography>
                  </MenuItem>
                </Stack>
              )
            )}
            <Stack direction={"row"} spacing={2}>
              <MenuItem
                sx={{
                  width: "200px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
                onClick={logoutUser}
              >
                <Icon sx={{ width: "50px" }}>
                  <SignOut />
                </Icon>
                <Typography textAlign="center">Logout</Typography>
              </MenuItem>
            </Stack>
          </Menu>
        </Box>
      </AppBar>
    </>
  );
};

export default MobileSidebar;
