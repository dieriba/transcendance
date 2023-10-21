import { Box, IconButton, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { X } from "phosphor-react";
import { useAppDispatch } from "../../redux/hooks";
import { closeSidebar } from "../../redux/features/sidebar.slices";
const ChatContactInfo = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  return (
    <Box width="320px" height="100vh">
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
            justifyContent="space-between"
            spacing={3}
          >
            <Typography variant="subtitle2">Contact Info</Typography>
            <IconButton onClick={() => dispatch(closeSidebar())}>
              <X />
            </IconButton>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default ChatContactInfo;
