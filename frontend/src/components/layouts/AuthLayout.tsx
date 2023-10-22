import { Container } from "@mui/material";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <Container sx={{ mt: 20 }} maxWidth="sm">
      <Outlet />
    </Container>
  );
};

export default AuthLayout;
