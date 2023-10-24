import { Box, IconButton, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { CaretLeft } from "phosphor-react";
const ProfilePage = () => {
  const theme = useTheme();
  return (
    <>
      <Stack direction={"row"} sx={{ width: "100%" }}>
        <Box
          sx={{
            position: "relative",
            width: 320,
            backgroundColor:
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background.paper,
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
          }}
        >
          <Stack p={4} spacing={5}>
            <Stack direction="row" alignItems="center" spacing={3}>
              <IconButton>
                <CaretLeft size={24} color="#4B4B4B" />
              </IconButton>
              <Typography variant="h5">Profile</Typography>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </>
  );
};

export default ProfilePage;
