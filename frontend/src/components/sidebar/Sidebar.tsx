import { Menu, MenuItem } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Avatar, Box, IconButton, Stack } from "@mui/material";
import { Nav_Buttons, Nav_Setting, Profile_Menu } from "../../data/data";
import { Gear, SignOut } from "phosphor-react";
import { useState } from "react";
import { faker } from "@faker-js/faker";
import { useThemeContext } from "../../theme/ThemeContextProvider";
import MaterialUISwitch from "./Switch";
import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../redux/features/user.slice";
import { useAppDispatch } from "../../redux/hooks";

const Sidebar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedIcon, setSelectedIcon] = useState(2);
  const { toggleColorMode } = useThemeContext();
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleNavigate = (index: number, path: string) => {
    setSelectedIcon(index);

    navigate(path);
  };
  return (
    <>
      <Box
        p={2}
        sx={{
          backgroundColor: theme.palette.background.paper,
          boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
          height: "100vh",
          width: 100,
        }}
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
            spacing={3}
            sx={{ width: "max-content", alignItems: "center" }}
          >
            {Nav_Buttons.map((button, index) =>
              index === selectedIcon ? (
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
                  onClick={() => handleNavigate(index, button.path)}
                >
                  <IconButton sx={{ width: "max-content" }} key={index}>
                    {button.icon}
                  </IconButton>
                </Box>
              )
            )}
            {selectedIcon === Nav_Buttons.length + 1 ? (
              <Box
                p={1}
                sx={{
                  borderRadius: 1.5,
                  backgroundColor: theme.palette?.primary.main,
                }}
              >
                <IconButton sx={{ width: "max-content", color: "#fff" }}>
                  <Gear />
                </IconButton>
              </Box>
            ) : (
              <Box
                p={1}
                sx={{
                  borderRadius: 1.5,
                }}
                onClick={() =>
                  handleNavigate(Nav_Buttons.length + 1, Nav_Setting[0].path)
                }
              >
                <IconButton>
                  <Gear />
                </IconButton>
              </Box>
            )}
          </Stack>
          <Stack alignItems="center" spacing={2}>
            <IconButton onClick={() => dispatch(logout())}>
              <SignOut />
            </IconButton>
            <MaterialUISwitch theme={theme} onClick={toggleColorMode} />
            <Avatar
              id="avatar-menu"
              aria-controls={open ? "demo-positioned-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
              src={faker.image.avatar()}
              sx={{ cursor: "pointer" }}
            />
            <Menu
              id="demo-positioned-menu"
              aria-labelledby="avatar-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              {Profile_Menu.map((item, index) => (
                <MenuItem onClick={handleClose} key={index}>
                  <Stack
                    sx={{
                      width: 100,
                    }}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <span>{item.title}</span>
                    {item.icon}
                  </Stack>
                </MenuItem>
              ))}
            </Menu>
          </Stack>
        </Stack>
      </Box>
    </>
  );
};

export default Sidebar;
