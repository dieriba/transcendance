export type ServerError = {
  error: string;
  message: string;
  statusCode: number;
};

export type BaseServerResponse = {
  message: string;
  statusCode: number;
};

export type ErrorSocket = {
  message: string;
  type: string;
};
