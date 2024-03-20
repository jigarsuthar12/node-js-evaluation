import { IsNotEmpty, IsString } from "class-validator";

export class SendTwoFactorDto {
  @IsNotEmpty()
  @IsString()
  number: string;
}
