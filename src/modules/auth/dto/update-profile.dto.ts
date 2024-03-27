import { Constants } from "@configs";
import { IsBoolean, IsEmail, IsOptional, IsString, Length, Matches, MaxLength } from "class-validator";

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(Constants.NAME_LENGTH)
  name: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  @MaxLength(Constants.EMAIL_MAX_LENGTH)
  email: string;

  @IsString()
  @IsOptional()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).*$/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  })
  @Length(Constants.PASSWORD_MIN_LENGTH, Constants.PASSWORD_MAX_LENGTH)
  password: string;

  @IsString()
  @IsOptional()
  @Length(Constants.NUMBER_LENGTH)
  number: string;

  @IsOptional()
  @IsString()
  @MaxLength(Constants.ADDRESS_LENGTH)
  address: string;

  @IsOptional()
  @IsBoolean()
  is2FAEnabled?: boolean;

  @IsOptional()
  @IsString()
  userType?: string;
}
