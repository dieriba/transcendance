const General = 'general';

export enum GeneralEvent {
  EMIT_TO_MYSELF = `${General}.emit.to.myself`,
  BROADCAST = 'broadcast',
  USER_UPDATE_STATUS = `${General}.user.update.status`,
  EXCEPTION = 'exception',
  SUCCESS = `${General}.success`,
  JOIN = `${General}.join`,
  LEAVE = `${General}.leave`,
  NEW_PROFILE_PICTURE = `${General}.new.profile.pic`,
  USER_CHANGED_AVATAR = `${General}.new.avatar.pic`,
  UPDATE_USER_PROFILE = `${General}.update.user`,
  USER_CHANGED_USERNAME = `${General}.changed.username`,
  TOKEN_NOT_VALID = `${General}.token.not.valid`,
  DISCONNECT_ALL_INSTANCE_OF_ME = `${General}.disconnect.all.instance.of.me`,
  DISCONNECT_ME = `${General}.disconnect.me`,
  DISCONNECT_ALL_EXCEPT_ME = `${General}.disconnect.all.except.me`,
  DISCONNECT = 'disconnect',
  NEW_BLOCKED_USER = `${General}.add.blocked.user`,
  REMOVE_BLOCKED_USER = `${General}.remove.blocked.user`,
  DESERTER = `${General}.deserter`,
}

const friend = 'friend';

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

const privateChatroom = 'chatroom.private';

export enum ChatEventPrivateRoom {
  NEW_CHATROOM = `${privateChatroom}.new.chatroom`,
  SEND_PRIVATE_MESSAGE = `${privateChatroom}.sent.private.message`,
  RECEIVE_PRIVATE_MESSAGE = `${privateChatroom}.receive.private.message`,
  CLEAR_CHATROOM = `${privateChatroom}.clear.chatroom`,
  CREATE_PRIVATE_CHATROOM = `${privateChatroom}.create.private.chatroom`,
}

const groupChatroom = 'chatroom.group';

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
  DELETE_GROUP = `${groupChatroom}.delete.group`,
  NEW_ADMIN = `${groupChatroom}.new.admin`,
  PREVIOUS_ADMIN_LEAVED = `${groupChatroom}.previous.admin.leaved`,
  NEW_USER_CHATROOM = `${groupChatroom}.new.user.chatroom`,
  CHANGE_USER_ROLE = `${groupChatroom}.change.user.role`,
  USER_ROLE_CHANGED = `${groupChatroom}.user.role.changed`,
  RESTRICT_USER = `${groupChatroom}.restrict.user`,
  USER_RESTRICTED = `${groupChatroom}.user.restricted`,
  USER_BANNED_MUTED_KICKED_RESTRICTION = `${groupChatroom}.user.banned.kicked.restriction`,
  USER_UNBANNED_UNKICKED_UNMUTED = `${groupChatroom}.user.unbanned.unkicked.unmuted.restriction`,
  UNRESTRICT_USER = `${groupChatroom}.unrestrict.user`,
  USER_UNRESTRICTED = `${groupChatroom}.user.unrestricted`,
  KICK_USER = `${groupChatroom}.kick.user`,
  USER_KICKED = `${groupChatroom}.user.kicked`,
  BEEN_KICKED = `${groupChatroom}.been.kicked`,
  LEAVE_GROUP = `${groupChatroom}.leave.group`,
  USER_LEAVED = `${groupChatroom}.user.leaved`,
  DELETE_GROUP_CHATROOM = `${groupChatroom}.delete.group`,
  GROUP_CHATROOM_DELETED = `${groupChatroom}.chatroom.deleted`,
  ADD_FRIEND_USER = `${groupChatroom}.add.user`,
  USER_ADDED = `${groupChatroom}.chatroom.user.added`,
  ADD_INVITE_USER = `${groupChatroom}.invite.user`,
  RECEIVED_GROUP_INVITATION = `${groupChatroom}.received.group.invitation`,
  DELETE_GROUP_INVITATION = `${groupChatroom}.delete.group.invitation`,
  CANCEL_USER_INVITATION = `${groupChatroom}.cancel.user.invitation`,
  DECLINE_GROUP_INVITATION = `${groupChatroom}.decline.group.invitation`,
  USER_DECLINED_INVITATION = `${groupChatroom}.user.declined.invitation`,
  CREATE_NEW_CHAT = `${groupChatroom}.create.new.chat`,
}

const pong = 'pong';
export const PONG_ROOM_PREFIX = 'pong_';
export enum PongEvent {
  ARROW_UP = `ArrowUp`,
  ARROW_DOWN = `ArrowDown`,
  NEW_PLAYER = `${pong}.new.player`,
  PADDLE_UP = `${pong}.up`,
  PADDLE_DOWN = `${pong}.down`,
  JOIN_QUEUE = `${pong}.join.queue`,
  LEAVE_QUEUE = `${pong}.leave.queue`,
  LETS_PLAY = `${pong}.lets.play`,
  REFRESHING_AND_LEAVE_QUEUE = `${pong}.refresh.leave.queue`,
  UPDATE_GAME = `${pong}.update.game`,
  USER_NO_MORE_IN_GAME = `${pong}.user.no.more.in.game`,
  SEND_GAME_INVITATION = `${pong}.send.game.invitation`,
  RECEIVE_GAME_INVITATION = `${pong}.receive.game.invitation`,
  ACCEPT_GAME_INVITATION = `${pong}.accept.game.invitation`,
  DECLINE_GAME_INVITATION = `${pong}.decline.game.invitation`,
  USER_DECLINED_INVITATION = `${pong}.user.declined.invitation`,
  UPDATE_PLAYER_POSITION = `${pong}.update.paddle.position`,
  USER_STOP_UPDATE = `${pong}.user.stop.update`,
  END_GAME = `${pong}.end.game`,
  JOIN_BACK_CURRENT_GAME = `${pong}.join.current.game`,
}
