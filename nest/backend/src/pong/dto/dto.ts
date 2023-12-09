import { IsEnum, IsIn, IsNotEmpty, IsString } from 'class-validator';
import { PongEvent } from '../../../shared/socket.event';
import { PongGameType, pongType } from '../../../shared/constant';

enum Position {
  ARROW_UP = PongEvent.ARROW_UP,
  ARROW_DOWN = PongEvent.ARROW_DOWN,
}

export class UpdatePlayerPositionDto {
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsString()
  @IsEnum(Position)
  keyPressed: Position;
}

export class PongGameTypeDto {
  @IsIn(pongType)
  pongType: PongGameType;
}

export class GameIdDto {
  @IsString()
  @IsNotEmpty()
  gameId: string;
}

export class GameInvitationDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsIn(pongType)
  pongType: PongGameType;
}
