import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RecipientDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
