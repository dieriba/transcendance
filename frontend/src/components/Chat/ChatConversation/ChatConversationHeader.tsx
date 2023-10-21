import { Avatar, Box, IconButton, Stack, Typography } from "@mui/material";
import { faker } from "@faker-js/faker";
import { CaretDown } from "phosphor-react";
import { useTheme } from "@mui/material/styles";
import StyledBadge from "../../Badge/StyledBadge";
import { toggle } from "../../../redux/features/sidebar.slices";
import { useAppDispatch } from "../../../redux/hooks";

const ChatConversationHeader = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  return (
    <Box
      p={2}
      sx={{
        width: "100%",
        backgroundColor:
          theme.palette.mode === "light"
            ? "#F8FAFF"
            : theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25",
      }}
    >
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        sx={{ width: "100%", height: "100%" }}
      >
        <Stack direction="row" spacing={2}>
          <Box>
            <StyledBadge
              sx={{ cursor: "pointer" }}
              onClick={() => dispatch(toggle())}
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar
                src={faker.image.avatar()}
                alt={faker.person.firstName()}
              />
            </StyledBadge>
          </Box>
          <Stack>
            <Typography variant="subtitle2">
              {faker.person.fullName()}
            </Typography>
            <Typography variant="subtitle2">Online</Typography>
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton>
            <CaretDown />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ChatConversationHeader;
