const friend = "friend";

export enum FriendEvent {
  REQUEST_RECEIVED = `${friend}.request.received`,
  NEW_REQUEST_RECEIVED = `${friend}.new.request.received`,
  REQUEST_SENT = `${friend}.request.sent`,
  NEW_REQUEST_SENT = `${friend}.new.request.sent`,
  CANCEL_REQUEST = `${friend}.cancel.request`,
  CLEAR_REQUEST = `${friend}.clear.request`,
  REQUEST_ACCEPTED = `${friend}.request.accepted`,
  DELETE_FRIEND = `${friend}.delete.friend`,
  BLOCK_FRIEND = `${friend}.block.friend`,
  UNBLOCK_FRIEND = `${friend}.unblock.friend`,
  NEW_FRIEND = `${friend}.new.friend`,
  NEW_CHATROOM = `${friend}.new.chatroom`,
}

const privateChatroom = "chatroom.private";

export enum ChatEventPrivateRoom {
  NEW_FRIEND = `${privateChatroom}.new.friend`,
  SEND_PRIVATE_MESSAGE = `${privateChatroom}.sent.private.message`,
  RECEIVE_PRIVATE_MESSAGE = `${privateChatroom}.receive.private.message`,
}

const groupChatroom = "chatroom.group";

export enum ChatEvent {
  //CREATE_GROUP_CHATROOM = `${groupChatroom}.create`,

  ADD_USER = "chatroom.add.user",
  SET_DIERIBA = "chatroom.set.dieriba",
  DELETE_USER = "chatroom.delete.user",
  CHANGE_USER_ROLE = "chatroom.change.user.role",
  RESTRICT_USER = "chatroom.restrict.user",
  UNRESTRICT_USER = "chatroom.unrestrict.user",
  JOIN = "chatroom.join",
  SEND_MESSAGE = "chatroom.send.message",

  CREATED = "chatroom.created",
  USER_ADDED = "chatroom.user.added",
  NEW_DIERIBA = "chatroom.new.dieriba",
  USER_DELETED = "chatroom.user.deleted",
  USER_ROLE_CHANGED = "chatroom.user.role.changed",
  USER_RESTRICT_LIFE = "chatroom.user.restrict.life",
  USER_RESTRICT_CHAT_ADMIN = "chatroom.user.restrict.chat.admin",
  USER_RESTRICTED = "chatroom.user.restricted",
  USER_UNRESTRICTED = "chatroom.user.unrestricted",
  USER_JOINED = "chatroom.user.joined",
  PRIVATE_CHAT_SEND_MESSAGE = "private.chat.send.message",
}
