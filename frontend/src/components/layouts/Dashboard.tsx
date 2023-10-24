import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import { Stack } from "@mui/material";

const DashboardLayout = () => {
  return (
    <Stack direction="row">
      <Sidebar />
      <Outlet />
    </Stack>
  );
};

export default DashboardLayout;
