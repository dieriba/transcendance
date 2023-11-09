const General = "general";

export enum GeneralEvent {
  USER_LOGGED_OUT = `${General}.user.logged.out`,
  USER_LOGGED_IN = `${General}.user.logged.in`,
  EXCEPTION = "exception",
  SUCCESS = `${General}.success`,
}

const friend = "friend";

export enum FriendEvent {
  REQUEST_RECEIVED = `${friend}.request.received`,
  NEW_REQUEST_RECEIVED = `${friend}.new.request.received`,
  ADD_NEW_REQUEST = `${friend}.add.new.friend.request`,
  REQUEST_SENT = `${friend}.request.sent`,
  NEW_REQUEST_SENT = `${friend}.new.request.sent`,
  CANCEL_REQUEST = `${friend}.cancel.request`,
  CLEAR_REQUEST = `${friend}.clear.request`,
  NEW_REQUEST_ACCEPTED = `${friend}.new.request.accepted`,
  REQUEST_ACCEPTED = `${friend}.request.accepted`,
  REQUEST_ACCEPTED_FROM_RECIPIENT = `${friend}.request.accepted.from.recipient`,
  DELETE_FRIEND = `${friend}.delete.friend`,
  BLOCK_FRIEND = `${friend}.block.friend`,
  UNBLOCK_FRIEND = `${friend}.unblock.friend`,
  NEW_FRIEND = `${friend}.new.friend`,
}

const privateChatroom = "chatroom.private";

export enum ChatEventPrivateRoom {
  NEW_CHATROOM = `${privateChatroom}.new.chatroom`,
  SEND_PRIVATE_MESSAGE = `${privateChatroom}.sent.private.message`,
  RECEIVE_PRIVATE_MESSAGE = `${privateChatroom}.receive.private.message`,
  CLEAR_CHATROOM = `${privateChatroom}.clear.chatroom`,
}

const groupChatroom = "chatroom.group";

export enum ChatEventGroup {
  CREATE_GROUP_CHATROOM = `${groupChatroom}.create`,
  SEND_GROUP_MESSAGE = `${groupChatroom}.send.message`,
  NEW_CHATROOM = `${groupChatroom}.new.chatroom`,
  RECEIVE_GROUP_MESSAGE = `${groupChatroom}.receive.group.message`,
  CLEAR_CHATROOM = `${groupChatroom}.clear.chatroom`,
  REQUEST_ALL_CHATROOM = `${groupChatroom}.request.all.chatroom`,
  GET_ALL_CHATROOM = `${groupChatroom}.get.all.chatroom`,
  REQUEST_ALL_CHATROOM_MESSAGE = `${groupChatroom}.request.all.chatroom.message`,
  GET_ALL_CHATROOM_MESSAGE = `${groupChatroom}.request.all.chatroom.message`,
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
