const path = (root: string, sublink: string) => {
  return `${root}${sublink}`;
};

const ROOTS_DASHBOARD = "/";

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  general: {
    profile: path(ROOTS_DASHBOARD, "profile"),
    chat: path(ROOTS_DASHBOARD, "chats"),
    group: path(ROOTS_DASHBOARD, "groups"),
    games: path(ROOTS_DASHBOARD, "games"),
    security: path(ROOTS_DASHBOARD, "security"),
    settings: path(ROOTS_DASHBOARD, "settings"),
  },
};
