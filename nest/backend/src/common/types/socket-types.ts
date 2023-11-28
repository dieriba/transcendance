export type SocketServerResponse = {
  message: string;
  data: unknown;
  chatroomId?: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
};
