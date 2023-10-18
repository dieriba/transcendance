import { useTheme } from "@mui/material";
import { Avatar, Box, IconButton, Stack } from "@mui/material";
import { Nav_Buttons, Nav_Setting } from "../../data/data";
import { Gear } from "phosphor-react";
import { useState } from "react";
import { faker } from "@faker-js/faker";
import { useThemeContext } from "../../theme/ThemeContextProvider";
import MaterialUISwitch from "./Switch";

const Sidebar = () => {
  const theme = useTheme();

  const [selectedIcon, setSelectedIcon] = useState(2);
  const { toggleColorMode } = useThemeContext();
  return (
    <>
      <Box
        p={2}
        sx={{
          backgroundColor: theme.palette?.background?.paper,
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
            {Nav_Buttons.map((button) =>
              button.index === selectedIcon ? (
                <Box
                  p={1}
                  sx={{
                    borderRadius: 1.5,
                    backgroundColor: theme.palette?.primary.main,
                  }}
                  key={button.index}
                >
                  <IconButton
                    key={button.index}
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
                  key={button.index}
                >
                  <IconButton
                    sx={{ width: "max-content" }}
                    key={button.index}
                    onClick={() => setSelectedIcon(button.index)}
                  >
                    {button.icon}
                  </IconButton>
                </Box>
              )
            )}
            {selectedIcon === Nav_Setting[0].index ? (
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
              >
                <IconButton
                  onClick={() => setSelectedIcon(Nav_Setting[0].index)}
                >
                  <Gear />
                </IconButton>
              </Box>
            )}
          </Stack>
          <Stack alignItems="center" spacing={2}>
            <MaterialUISwitch theme={theme} onClick={toggleColorMode} />
            <Avatar src={faker.image.avatar()} />
          </Stack>
        </Stack>
      </Box>
    </>
  );
};

export default Sidebar;
