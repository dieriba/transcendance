import { IsNotEmpty, IsString } from 'class-validator';

export class RecipientDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
