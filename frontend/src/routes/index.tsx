import { Navigate, useRoutes } from "react-router-dom";

// layouts

// config
import { DEFAULT_PATH } from "../config";
import DashboardLayout from "../components/layouts/dashboard/Dashboard";
import Loadable from "./Loadable";

export default function Router() {
  return useRoutes([
    {
      path: "/auth",
      children: [
        { path: "login", element: <LoginPage /> },
        { path: "register", element: <RegisterPage /> },
      ],
    },
    {
      path: "/",
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to={DEFAULT_PATH} replace />, index: true },
        { path: "404", element: <Page404 /> },
        { path: "*", element: <Navigate to="/404" replace /> },
      ],
    },

    { path: "*", element: <Navigate to="/404" replace /> },
  ]);
}

const Page404 = Loadable(() => import("../pages/error-page/Error-404"));

const LoginPage = Loadable(() => import("../pages/auth/Login"));
const RegisterPage = Loadable(() => import("../pages/auth/Register"));
