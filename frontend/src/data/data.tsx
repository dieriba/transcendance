/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { faker } from "@faker-js/faker";
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
import { FriendProps } from "../components/friends/FriendsTable";

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

const CallList = [
  {
    id: 0,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    online: true,
    incoming: true,
    missed: false,
  },
  {
    id: 1,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    online: true,
    incoming: false,
    missed: true,
  },
  {
    id: 2,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    online: false,
    incoming: true,
    missed: true,
  },
  {
    id: 3,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    online: false,
    incoming: false,
    missed: false,
  },
  {
    id: 4,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    online: true,
    incoming: true,
    missed: false,
  },
  {
    id: 5,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    online: false,
    incoming: false,
    missed: false,
  },
  {
    id: 6,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    online: true,
    incoming: true,
    missed: false,
  },
  {
    id: 7,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    online: false,
    incoming: false,
    missed: false,
  },
  {
    id: 8,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    online: true,
    incoming: true,
    missed: false,
  },
  {
    id: 9,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    online: false,
    incoming: false,
    missed: false,
  },
  {
    id: 10,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    online: true,
    incoming: true,
    missed: false,
  },
  {
    id: 11,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    online: false,
    incoming: false,
    missed: false,
  },
  {
    id: 12,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    online: true,
    incoming: true,
    missed: false,
  },
  {
    id: 13,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    online: true,
    incoming: true,
    missed: false,
  },
  {
    id: 14,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    online: true,
    incoming: true,
    missed: false,
  },
  {
    id: 15,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    online: true,
    incoming: true,
    missed: false,
  },
];

const ChatList = [
  {
    id: 0,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    msg: faker.music.songName(),
    time: "9:36",
    unread: 0,
    pinned: true,
    online: true,
  },
  {
    id: 1,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    msg: faker.music.songName(),
    time: "12:02",
    unread: 2,
    pinned: true,
    online: false,
  },
  {
    id: 2,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    msg: faker.music.songName(),
    time: "10:35",
    unread: 3,
    pinned: false,
    online: true,
  },
  {
    id: 3,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    msg: faker.music.songName(),
    time: "04:00",
    unread: 0,
    pinned: false,
    online: true,
  },
  {
    id: 4,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    msg: faker.music.songName(),
    time: "08:42",
    unread: 0,
    pinned: false,
    online: false,
  },
  {
    id: 5,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    msg: faker.music.songName(),
    time: "08:42",
    unread: 0,
    pinned: false,
    online: false,
  },
  {
    id: 6,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    msg: faker.music.songName(),
    time: "08:42",
    unread: 0,
    pinned: false,
    online: false,
  },
  {
    id: 7,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    msg: faker.music.songName(),
    time: "08:42",
    unread: 0,
    pinned: false,
    online: false,
  },
  {
    id: 8,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    msg: faker.music.songName(),
    time: "08:42",
    unread: 0,
    pinned: false,
    online: false,
  },
  {
    id: 9,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    msg: faker.music.songName(),
    time: "08:42",
    unread: 0,
    pinned: false,
    online: false,
  },
  {
    id: 10,
    img: faker.image.avatar(),
    name: faker.person.firstName(),
    msg: faker.music.songName(),
    time: "08:42",
    unread: 0,
    pinned: false,
    online: false,
  },
];

export interface ChatMessageProps {
  incoming?: boolean;
  preview?: string;
  outgoing?: boolean;
  reply?: string;
  message?: string;
  subtype?: string;
  img?: string;
  text?: string;
  date?: string;
  type: string;
}

const Chat_History: ChatMessageProps[] = [
  {
    type: "msg",
    message: "Hi 👋🏻, How are ya ?",
    incoming: true,
    outgoing: false,
  },
  {
    type: "divider",
    text: "Today",
  },
  {
    type: "msg",
    message: "Hi 👋 Panda, not bad, u ?",
    incoming: false,
    outgoing: true,
  },
  {
    type: "msg",
    message: "Can you send me an abstarct image?",
    incoming: false,
    outgoing: true,
  },
  {
    type: "msg",
    message: "Ya sure, sending you a pic",
    incoming: true,
    outgoing: false,
  },

  {
    type: "msg",
    subtype: "img",
    message: "Here You Go",
    img: faker.image.avatar(),
    incoming: true,
    outgoing: false,
  },
  {
    type: "msg",
    message: "Can you please send this in file format?",
    incoming: false,
    outgoing: true,
  },

  {
    type: "msg",
    subtype: "doc",
    message: "Yes sure, here you go.",
    incoming: true,
    outgoing: false,
  },
  {
    type: "msg",
    subtype: "link",
    preview: faker.image.avatarGitHub(),
    message: "Yep, I can also do that",
    incoming: true,
    outgoing: false,
  },
  {
    type: "msg",
    subtype: "reply",
    reply: "This is a reply",
    message: "Yep, I can also do that",
    incoming: false,
    outgoing: true,
  },

  {
    type: "msg",
    subtype: "reply",
    reply: "This is a reply",
    message: "Yep, I can also do that",
    incoming: false,
    outgoing: true,
  },
  {
    type: "msg",
    subtype: "reply",
    reply: "This is a reply",
    message: "Yep, I can also do that",
    incoming: false,
    outgoing: true,
  },
  {
    type: "msg",
    subtype: "reply",
    reply: "This is a reply",
    message: "Yep, I can also do that",
    incoming: false,
    outgoing: true,
  },
  {
    type: "msg",
    subtype: "reply",
    reply: "This is a reply",
    message: "Yep, I can also do that",
    incoming: false,
    outgoing: true,
  },
];

export const friends: FriendProps[] = [
  {
    id: faker.string.alphanumeric(),
    avatar: faker.image.avatar(),
    profile: faker.string.alphanumeric(),
    nickname: faker.person.firstName(),
    friendSince: faker.date.anytime().toLocaleDateString("fr-FR"),
  },
  {
    id: faker.string.alphanumeric(),
    avatar: faker.image.avatar(),
    profile: faker.string.alphanumeric(),
    nickname: faker.person.firstName(),
    friendSince: faker.date.anytime().toLocaleDateString("fr-FR"),
  },
  {
    id: faker.string.alphanumeric(),
    avatar: faker.image.avatar(),
    profile: faker.string.alphanumeric(),
    nickname: faker.person.firstName(),
    friendSince: faker.date.anytime().toLocaleDateString("fr-FR"),
  },
  {
    id: faker.string.alphanumeric(),
    avatar: faker.image.avatar(),
    profile: faker.string.alphanumeric(),
    nickname: faker.person.firstName(),
    friendSince: faker.date.anytime().toLocaleDateString("fr-FR"),
  },
  {
    id: faker.string.alphanumeric(),
    avatar: faker.image.avatar(),
    profile: faker.string.alphanumeric(),
    nickname: faker.person.firstName(),
    friendSince: faker.date.anytime().toLocaleDateString("fr-FR"),
  },
  {
    id: faker.string.alphanumeric(),
    avatar: faker.image.avatar(),
    profile: faker.string.alphanumeric(),
    nickname: faker.person.firstName(),
    friendSince: faker.date.anytime().toLocaleDateString("fr-FR"),
  },
  {
    id: faker.string.alphanumeric(),
    avatar: faker.image.avatar(),
    profile: faker.string.alphanumeric(),
    nickname: faker.person.firstName(),
    friendSince: faker.date.anytime().toLocaleDateString("fr-FR"),
  },
  {
    id: faker.string.alphanumeric(),
    avatar: faker.image.avatar(),
    profile: faker.string.alphanumeric(),
    nickname: faker.person.firstName(),
    friendSince: faker.date.anytime().toLocaleDateString("fr-FR"),
  },
  {
    id: faker.string.alphanumeric(),
    avatar: faker.image.avatar(),
    profile: faker.string.alphanumeric(),
    nickname: faker.person.firstName(),
    friendSince: faker.date.anytime().toLocaleDateString("fr-FR"),
  },
  {
    id: faker.string.alphanumeric(),
    avatar: faker.image.avatar(),
    profile: faker.string.alphanumeric(),
    nickname: faker.person.firstName(),
    friendSince: faker.date.anytime().toLocaleDateString("fr-FR"),
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

const Shared_docs = [
  {
    type: "msg",
    subtype: "doc",
    message: "Yes sure, here you go.",
    incoming: true,
    outgoing: false,
  },
  {
    type: "msg",
    subtype: "doc",
    message: "Yes sure, here you go.",
    incoming: true,
    outgoing: false,
  },
  {
    type: "msg",
    subtype: "doc",
    message: "Yes sure, here you go.",
    incoming: true,
    outgoing: false,
  },
  {
    type: "msg",
    subtype: "doc",
    message: "Yes sure, here you go.",
    incoming: true,
    outgoing: false,
  },
  {
    type: "msg",
    subtype: "doc",
    message: "Yes sure, here you go.",
    incoming: true,
    outgoing: false,
  },
  {
    type: "msg",
    subtype: "doc",
    message: "Yes sure, here you go.",
    incoming: true,
    outgoing: false,
  },
  {
    type: "msg",
    subtype: "doc",
    message: "Yes sure, here you go.",
    incoming: true,
    outgoing: false,
  },
  {
    type: "msg",
    subtype: "doc",
    message: "Yes sure, here you go.",
    incoming: true,
    outgoing: false,
  },
];

const Shared_links = [
  {
    type: "msg",
    subtype: "link",
    preview: faker.image.cats(),
    message: "Yep, I can also do that",
    incoming: true,
    outgoing: false,
  },
  {
    type: "msg",
    subtype: "link",
    preview: faker.image.cats(),
    message: "Yep, I can also do that",
    incoming: true,
    outgoing: false,
  },
  {
    type: "msg",
    subtype: "link",
    preview: faker.image.cats(),
    message: "Yep, I can also do that",
    incoming: true,
    outgoing: false,
  },
  {
    type: "msg",
    subtype: "link",
    preview: faker.image.avatarGitHub(),
    message: "Yep, I can also do that",
    incoming: true,
    outgoing: false,
  },
  {
    type: "msg",
    subtype: "link",
    preview: faker.image.avatarGitHub(),
    message: "Yep, I can also do that",
    incoming: true,
    outgoing: false,
  },
  {
    type: "msg",
    subtype: "link",
    preview: faker.image.avatarGitHub(),
    message: "Yep, I can also do that",
    incoming: true,
    outgoing: false,
  },
];

export {
  Profile_Menu,
  Nav_Setting,
  Nav_Buttons,
  ChatList,
  Chat_History,
  Message_options,
  Shared_links,
  Shared_docs,
  CallList,
};
