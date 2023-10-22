import { Navigate, useRoutes } from "react-router-dom";

// layouts

// config
import { DEFAULT_PATH } from "../config";
import DashboardLayout from "../components/layouts/Dashboard";
import Loadable from "./Loadable";
import AuthLayout from "../components/layouts/AuthLayout";

export default function Router() {
  return useRoutes([
    {
      path: "/auth",
      element: <AuthLayout />,
      children: [
        { path: "login", element: <LoginPage /> },
        { path: "register", element: <RegisterPage /> },
        { path: "*", element: <Navigate to="/404" replace /> },
      ],
    },
    {
      path: "/",
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to={DEFAULT_PATH} replace />, index: true },
        { path: "chats", element: <ChatPage /> },
        { path: "group", element: <GroupChatPage /> },
        { path: "settings", element: <Settings /> },
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

const ChatPage = Loadable(() => import("../pages/Chats/Chat"));
const GroupChatPage = Loadable(() => import("../pages/Chats/GroupChatPage"));
const Settings = Loadable(() => import("../pages/Settings/Settings"));
