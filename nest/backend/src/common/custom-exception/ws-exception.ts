import { WsException } from '@nestjs/websockets';

type WsExceptionType = 'BadRequest' | 'Unauthorized' | 'Not Found' | 'Unknown';

export class WsTypeException extends WsException {
  readonly type: WsExceptionType;

  constructor(type: WsExceptionType, message: string | unknown) {
    const error = {
      type,
      message,
    };
    super(error);
    this.type = type;
  }
}

export class WsBadRequestException extends WsTypeException {
  constructor(message: string | unknown) {
    super('BadRequest', message);
  }
}

export class WsUnauthorizedException extends WsTypeException {
  constructor(message: string | unknown) {
    super('Unauthorized', message);
  }
}

export class WsNotFoundException extends WsTypeException {
  constructor(message: string | unknown) {
    super('Not Found', message);
  }
}

export class WsUnknownException extends WsTypeException {
  constructor(message: string | unknown) {
    super('Unknown', message);
  }
}

export class WsUserNotFoundException extends WsNotFoundException {
  constructor() {
    super('User Not Found');
  }
}

export class WsChatroomNotFoundException extends WsNotFoundException {
  constructor() {
    super('Chatroom Not Found');
  }
}

export class WsGameNotFoundException extends WsNotFoundException {
  constructor() {
    super('Chatroom Not Found');
  }
}
