/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import {
  ChatCircleDots,
  ChatsTeardrop,
  GameController,
  Gear,
  GearSix,
  Keyboard,
  SignOut,
  User,
  Users,
} from "phosphor-react";
import { PATH_APP } from "../routes/paths";
import { JSXElementConstructor, ReactElement } from "react";

export type ProfileMenuI = {
  title: string;
  path: string | undefined;
  icon: ReactElement<any, string | JSXElementConstructor<any>>;
};

const Profile_Menu: ProfileMenuI[] = [
  {
    title: "Profile",
    path: PATH_APP.dashboard.profile,
    icon: <User />,
  },
  {
    title: "Settings",
    path: PATH_APP.dashboard.settings,
    icon: <Gear />,
  },
  {
    title: "Sign Out",
    path: undefined,
    icon: <SignOut />,
  },
];

const Nav_Buttons = [
  {
    path: PATH_APP.dashboard.leaderboard,
    name: PATH_APP.dashboard.leaderboard.substring(1),
    icon: <Keyboard />,
  },
  {
    path: PATH_APP.dashboard.profile,
    name: PATH_APP.dashboard.profile.substring(1),
    icon: <User />,
  },
  {
    path: PATH_APP.dashboard.friends,
    name: PATH_APP.dashboard.friends.substring(1),
    icon: <Users />,
  },
  {
    path: PATH_APP.dashboard.chat,
    name: PATH_APP.dashboard.chat.substring(1),
    icon: <ChatCircleDots />,
  },
  {
    path: PATH_APP.dashboard.group,
    name: PATH_APP.dashboard.group.substring(1),
    icon: <ChatsTeardrop />,
  },
  {
    path: PATH_APP.dashboard.games,
    name: PATH_APP.dashboard.games.substring(1),
    icon: <GameController />,
  },
  {
    path: PATH_APP.dashboard.settings,
    name: PATH_APP.dashboard.settings.substring(1),
    icon: <GearSix />,
  },
];

export { Profile_Menu, Nav_Buttons };
