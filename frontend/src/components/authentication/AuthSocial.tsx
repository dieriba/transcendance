import { Box, Divider, IconButton, Stack } from "@mui/material";
import MySvg from "../../assets/42_Logo.svg";
const AuthSocial = () => {
  return (
    <Box>
      <Divider
        sx={{
          my: 2.5,
          typography: "overline",
          color: "text.disabled",
          "&::before, ::after": { borderTopStyle: "dashed" },
        }}
      >
        OR
      </Divider>

      <Stack justifyContent="center">
        <IconButton>
          <img height={60} width={60} src={MySvg} />
        </IconButton>
      </Stack>
    </Box>
  );
};

export default AuthSocial;
