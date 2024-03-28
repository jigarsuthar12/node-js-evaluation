import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SendTwoFactorDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
