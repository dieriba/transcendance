import { Navigate, useRoutes } from "react-router-dom";
import { DEFAULT_PATH } from "../config";
import ProtectedDashboardLayout from "../components/layouts/Dashboard";
import Loadable from "./Loadable";
import AuthLayout from "../components/layouts/AuthLayout";
import { PATH_APP } from "./paths";

export default function Router() {
  return useRoutes([
    {
      path: "/auth",
      element: <AuthLayout />,
      children: [
        { path: PATH_APP.auth.login, element: <LoginPage /> },
        { path: PATH_APP.auth.register, element: <RegisterPage /> },
        { path: PATH_APP.auth.oauth, element: <OauthPage /> },
        { path: "*", element: <Navigate to="/404" replace /> },
      ],
    },
    {
      path: "/",
      element: <ProtectedDashboardLayout />,
      children: [
        { element: <Navigate to={DEFAULT_PATH} replace />, index: true },
        { path: PATH_APP.dashboard.profile, element: <ProfilePage /> },
        { path: PATH_APP.dashboard.games, element: <GamesPage /> },
        { path: PATH_APP.dashboard.chat, element: <ChatPage /> },
        { path: PATH_APP.dashboard.group, element: <GroupChatPage /> },
        { path: PATH_APP.dashboard.settings, element: <SettingsPage /> },
        { path: "404", element: <Page404 /> },
        { path: "*", element: <Navigate to="/404" replace /> },
      ],
    },

    { path: "*", element: <Navigate to="/404" replace /> },
  ]);
}

const Page404 = Loadable(() => import("../pages/error-page/Error-404"));

const LoginPage = Loadable(() => import("../pages/auth/LoginPage"));
const RegisterPage = Loadable(() => import("../pages/auth/Register"));
const OauthPage = Loadable(() => import("../pages/auth/OauthPage"));

const ProfilePage = Loadable(() => import("../pages/Profile/ProfilePage"));
const ChatPage = Loadable(() => import("../pages/Chats/Chat"));
const GroupChatPage = Loadable(() => import("../pages/Chats/GroupChatPage"));
const SettingsPage = Loadable(() => import("../pages/Settings/SettingsPage"));
const GamesPage = Loadable(() => import("../pages/Games/Games"));
