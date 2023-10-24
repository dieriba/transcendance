import { Container } from "@mui/material";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";
import { PATH_APP } from "../../routes/paths";

const AuthLayout = () => {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  return isAuthenticated ? (
    <Navigate to={PATH_APP.dashboard.games} replace />
  ) : (
    <>
      <Container sx={{ mt: 20 }} maxWidth="sm">
        <Outlet />
      </Container>
    </>
  );
};

export default AuthLayout;
