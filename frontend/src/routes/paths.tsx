const path = (root: string, sublink: string) => {
  return `${root}${sublink}`;
};

const ROOT_DASHBOARD = "/";
const ROOT_AUTH = "/auth/";

export const PATH_APP = {
  root: ROOT_DASHBOARD,
  dashboard: {
    profile: path(ROOT_DASHBOARD, "profile"),
    notification: path(ROOT_DASHBOARD, "notification"),
    friends: path(ROOT_DASHBOARD, "friends"),
    chat: path(ROOT_DASHBOARD, "chats"),
    group: path(ROOT_DASHBOARD, "groups"),
    games: path(ROOT_DASHBOARD, "games"),
    security: path(ROOT_DASHBOARD, "security"),
    settings: path(ROOT_DASHBOARD, "settings"),
    pong: path(ROOT_DASHBOARD, "pong"),
  },
  auth: {
    login: path(ROOT_AUTH, "login"),
    register: path(ROOT_AUTH, "register"),
    oauth: path(ROOT_AUTH, "42/oauth"),
    twoFa: path(ROOT_AUTH, "2fa"),
  },
};
