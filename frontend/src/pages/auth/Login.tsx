import { Stack, Typography, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import LoginForm from "../../components/authentication/LoginForm";
import AuthSocial from "../../components/authentication/AuthSocial";
import { PATH_APP } from "../../routes/paths";
const Login = () => {
  return (
    <Stack spacing={2} sx={{ mb: 5, position: "relative" }}>
      <Typography variant="h4">Login</Typography>
      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">New User ?</Typography>
        <Link
          to={PATH_APP.auth.register}
          component={RouterLink}
          variant="subtitle2"
        >
          Create an account
        </Link>
      </Stack>
      <LoginForm />
      <AuthSocial />
    </Stack>
  );
};

export default Login;
