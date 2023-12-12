export const REGEX_NICKNAME = '^[a-zA-Z][a-zA-Z0-9_]*$';
export const REGEX_GROUP_NAME = '^[a-zA-Z0-9_]*$';

export const MIN_NICKNAME_LENGTH = 3;
export const MAX_NICKNAME_LENGTH = 16;

export const ERR_MSG_MINIMUM_NICKNAME_LENGTH = `Nickname must have at least ${MIN_NICKNAME_LENGTH} characters`;
export const ERR_MSG_MAXIMUM_NICKNAME_LENGTH = `Nickname must have at most ${MAX_NICKNAME_LENGTH} characters`;

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 24;

export const ERR_MSG_MINIMUM_PASSWORD_LENGTH = `Password must have at least ${MIN_PASSWORD_LENGTH} characters`;
export const ERR_MSG_MAXIMUM_PASSWORD_LENGTH = `Password must have at most ${MAX_PASSWORD_LENGTH} characters`;

export const MIN_NAME_LENGTH = 1;
export const MAX_NAME_LENGTH = 25;

export const MIN_CHATROOM_NAME_LENGTH = 3;
export const MAX_CHATROOM_NAME_LENGTH = 20;
export const ERR_MSG_MINIMUM_CHATROOM_NAME_LENGTH = `chatroom name must have at least ${MIN_CHATROOM_NAME_LENGTH} characters`;
export const ERR_MSG_MAXIMUM_CHATROOM_NAME_LENGTH = `chatroom name must have at most ${MAX_CHATROOM_NAME_LENGTH} characters`;

export const MIN_MESSAGE_LENGTH = 1;
export const MAX_MESSAGE_LENGTH = 255;
export const ERR_MSG_MAX_MESSAGE_LENGTH = `Message can contains at most ${MAX_MESSAGE_LENGTH} charactes`;

export const MIN_REASON_LENGTH = 10;
export const MAX_REASON_LENGTH = 255;

export const ERR_MSG_MINIMUM_REASON_LENGTH = `reason must have at least ${MIN_REASON_LENGTH} characters`;
export const ERR_MSG_MAXIMUM_REASON_LENGTH = `reason must have at most ${MAX_REASON_LENGTH} characters`;
