const path = (root: string, sublink: string) => {
  return `${root}${sublink}`;
};

const ROOT_DASHBOARD = "/";
const ROOT_AUTH = "/auth/";

export const PATH_APP = {
  root: ROOT_DASHBOARD,
  dashboard: {
    profile: path(ROOT_DASHBOARD, "profile"),
    chat: path(ROOT_DASHBOARD, "chats"),
    group: path(ROOT_DASHBOARD, "groups"),
    games: path(ROOT_DASHBOARD, "games"),
    security: path(ROOT_DASHBOARD, "security"),
    settings: path(ROOT_DASHBOARD, "settings"),
  },
  auth: {
    login: path(ROOT_AUTH, "login"),
    register: path(ROOT_AUTH, "register"),
  },
};
