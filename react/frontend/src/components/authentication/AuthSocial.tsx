import { Box, Divider, IconButton, Link, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import MySvg from "../../assets/42_Logo.svg";
const AuthSocial = () => {
  return (
    <Box>
      <Divider
        sx={{
          my: 2.5,
          typography: "overline",
          color: "text.disabled",
          "&::before, ::after": { borderTopStyle: "solid" },
        }}
      >
        OR
      </Divider>

      <Link to={import.meta.env.VITE_OAUTH_URL} component={RouterLink}>
        <Stack justifyContent="center">
          <IconButton>
            <img height={60} width={60} src={MySvg} />
          </IconButton>
        </Stack>
      </Link>
    </Box>
  );
};

export default AuthSocial;
