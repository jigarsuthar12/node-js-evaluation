import { Constants } from "@configs";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from "class-validator";

export class SignInDto {
  @IsString()
  @IsOptional()
  @IsEmail()
  @MaxLength(Constants.EMAIL_MAX_LENGTH)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(Constants.PASSWORD_MAX_LENGTH)
  password: string;

  @IsString()
  @IsOptional()
  @Length(Constants.NUMBER_LENGTH)
  number: string;
}
