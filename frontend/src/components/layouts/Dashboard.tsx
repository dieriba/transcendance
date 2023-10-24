import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import { Stack } from "@mui/material";
import { useAppSelector } from "../../redux/hooks";
import { PATH_APP } from "../../routes/paths";

const ProtectedDashboardLayout = () => {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  return isAuthenticated ? (
    <>
      <Stack direction="row">
        <Sidebar />
        <Outlet />
      </Stack>
    </>
  ) : (
    <Navigate to={PATH_APP.auth.login} replace />
  );
};

export default ProtectedDashboardLayout;
