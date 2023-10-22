import { useTheme } from "@mui/material/styles";
import { Box, IconButton, Stack, Tab, Tabs, Typography } from "@mui/material";
import { CaretLeft } from "phosphor-react";
import {
  CONTACT,
  switchSidebarTab,
} from "../../../redux/features/sidebar.slices";
import { useAppDispatch } from "../../../redux/hooks";
import React from "react";
import DocMedia from "./DocMedia";

const SharedMessage = () => {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const dispatch = useAppDispatch();

  return (
    <Box sx={{ width: 320, height: "100vh" }}>
      <Stack sx={{ height: "100%" }}>
        <Box
          sx={{
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
            width: "100%",
            backgroundColor:
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background.default,
          }}
        >
          <Stack
            sx={{ height: "100%", p: 2 }}
            direction="row"
            alignItems="center"
            spacing={3}
          >
            <IconButton
              onClick={() => dispatch(switchSidebarTab({ tab: CONTACT }))}
            >
              <CaretLeft />
            </IconButton>
            <Typography variant="subtitle2">Shared Messages</Typography>
          </Stack>
        </Box>

        <Tabs
          sx={{ pt: 1, p: 2 }}
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab sx={{ width: "50%" }} label="Media" />
          <Tab sx={{ width: "50%" }} label="Docs" />
        </Tabs>

        <Stack
          sx={{
            height: "100%",
            position: "relative",
            flexGrow: 1,
            overflowY: "scroll",
          }}
          p={3}
          spacing={3}
        >
          <DocMedia value={value} />
        </Stack>
      </Stack>
    </Box>
  );
};

export default SharedMessage;
