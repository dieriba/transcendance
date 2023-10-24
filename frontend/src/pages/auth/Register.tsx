import { Link, Stack, Typography } from "@mui/material";
import RegisterForm from "../../components/authentication/RegisterForm";
import { Link as RouterLink } from "react-router-dom";
import { PATH_APP } from "../../routes/paths";
const Register = () => {
  return (
    <Stack spacing={2} sx={{ mb: 5, position: "relative" }}>
      <Typography variant="h4">Register</Typography>
      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">Already an account ?</Typography>
        <Link
          to={PATH_APP.auth.login}
          component={RouterLink}
          variant="subtitle2"
        >
          Login
        </Link>
      </Stack>
      <RegisterForm />
    </Stack>
  );
};

export default Register;
