import { Container } from "@mui/material";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";
import { PATH_APP } from "../../routes/paths";

const AuthLayout = () => {
  const isAuthenticated = useAppSelector((state) => state.user.access_token);

  return isAuthenticated ? (
    <Navigate to={PATH_APP.dashboard.games} replace />
  ) : (
    <>
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          minHeight: "100vh",
        }}
        maxWidth="sm"
      >
        <Outlet />
      </Container>
    </>
  );
};

export default AuthLayout;
