import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PongEvent } from '../../../shared/socket.event';

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

export class GameIdDto {
  @IsString()
  @IsNotEmpty()
  gameId: string;
}
