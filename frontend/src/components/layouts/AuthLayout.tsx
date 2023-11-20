import { Container } from "@mui/material";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";
import { PATH_APP } from "../../routes/paths";
import { RootState } from "../../redux/store";

const AuthLayout = () => {
  const { twoFa, access_token } = useAppSelector(
    (state: RootState) => state.user
  );
  const location = useLocation();

  if (location.pathname === PATH_APP.auth.twoFa + "/" && !twoFa) {
    return <Navigate to={PATH_APP.auth.login} replace />;
  }

  return access_token ? (
    <Navigate to={PATH_APP.dashboard.profile} replace />
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
