/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import {
  BellSimple,
  ChatCircleDots,
  ChatsTeardrop,
  GameController,
  Gear,
  GearSix,
  SignOut,
  User,
  Users,
} from "phosphor-react";
import { PATH_APP } from "../routes/paths";
import { JSXElementConstructor, ReactElement } from "react";
import { Badge } from "@mui/material";

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
    path: PATH_APP.dashboard.profile,
    icon: <User />,
  },
  {
    path: PATH_APP.dashboard.friends,
    icon: <Users />,
  },
  {
    path: PATH_APP.dashboard.notification,
    icon: (
      <Badge badgeContent={4} color="primary">
        <BellSimple />
      </Badge>
    ),
  },
  {
    path: PATH_APP.dashboard.chat,
    icon: <ChatCircleDots />,
  },
  {
    path: PATH_APP.dashboard.group,
    icon: <ChatsTeardrop />,
  },
  {
    path: PATH_APP.dashboard.games,
    icon: <GameController />,
  },
];

const Nav_Setting = [
  {
    path: PATH_APP.dashboard.settings,
    icon: <GearSix />,
  },
];

const Message_options = [
  {
    title: "Reply",
  },
  {
    title: "React to message",
  },
  {
    title: "Delete Message",
  },
];

export { Profile_Menu, Nav_Setting, Nav_Buttons, Message_options };
