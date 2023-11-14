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
  EDIT_GROUP_CHATROOM = `${groupChatroom}.edit`,
  UPDATED_GROUP_CHATROOM = `${groupChatroom}.updated`,
  SEND_GROUP_MESSAGE = `${groupChatroom}.send.message`,
  NEW_CHATROOM = `${groupChatroom}.new.chatroom`,
  RECEIVE_GROUP_MESSAGE = `${groupChatroom}.receive.group.message`,
  CLEAR_CHATROOM = `${groupChatroom}.clear.chatroom`,
  REQUEST_ALL_CHATROOM = `${groupChatroom}.request.all.chatroom`,
  GET_ALL_CHATROOM = `${groupChatroom}.get.all.chatroom`,
  REQUEST_ALL_CHATROOM_MESSAGE = `${groupChatroom}.request.all.chatroom.message`,
  GET_ALL_CHATROOM_MESSAGE = `${groupChatroom}.get.all.chatroom.message`,
  NEW_AVAILABLE_CHATROOM = `${groupChatroom}.new.available.chatroom`,
  JOIN_CHATROOM = `${groupChatroom}.join.chatroom`,
  SET_DIERIBA = `${groupChatroom}.set.dieriba`,
  DELETE_JOINABLE_GROUP = `${groupChatroom}.delete.joinable.group`,
  NEW_ADMIN = `${groupChatroom}.new.admin`,
  NEW_USER_CHATROOM = `${groupChatroom}.new.user.chatroom`,
  CHANGE_USER_ROLE = `${groupChatroom}.change.user.role`,
  USER_ROLE_CHANGED = `${groupChatroom}.user.role.changed`,
  RESTRICT_USER = `${groupChatroom}.restrict.user`,
  USER_RESTRICTED = `${groupChatroom}.user.restricted`,
  USER_BANNED_MUTED_KICKED_RESTRICTION = `${groupChatroom}.user.banned.kicked.restriction`,
  USER_UNBANNED_UNKICKED_UNMUTED = `${groupChatroom}.user.unbanned.unkicked.unmuted.restriction`,
  UNRESTRICT_USER = `${groupChatroom}.unrestrict.user`,
  USER_UNRESTRICTED = `${groupChatroom}.user.unrestricted`,

  ADD_USER = "chatroom.add.user",
  DELETE_USER = "chatroom.delete.user",

  USER_ADDED = "chatroom.user.added",
  USER_DELETED = "chatroom.user.deleted",
}
