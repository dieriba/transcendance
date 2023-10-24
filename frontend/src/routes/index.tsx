import { Navigate, useRoutes } from "react-router-dom";
import { DEFAULT_PATH } from "../config";
import DashboardLayout from "../components/layouts/Dashboard";
import Loadable from "./Loadable";
import AuthLayout from "../components/layouts/AuthLayout";
import { PATH_DASHBOARD } from "./paths";

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
        { path: PATH_DASHBOARD.general.profile, element: <ProfilePage /> },
        { path: PATH_DASHBOARD.general.games, element: <GamesPage /> },
        { path: PATH_DASHBOARD.general.chat, element: <ChatPage /> },
        { path: PATH_DASHBOARD.general.group, element: <GroupChatPage /> },
        { path: PATH_DASHBOARD.general.settings, element: <SettingsPage /> },
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

const ProfilePage = Loadable(() => import("../pages/Profile/ProfilePage"));
const ChatPage = Loadable(() => import("../pages/Chats/Chat"));
const GroupChatPage = Loadable(() => import("../pages/Chats/GroupChatPage"));
const SettingsPage = Loadable(() => import("../pages/Settings/SettingsPage"));
const GamesPage = Loadable(() => import("../pages/Games/Games"));
