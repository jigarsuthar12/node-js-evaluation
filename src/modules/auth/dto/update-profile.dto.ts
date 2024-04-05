import { Constants } from "@configs";
import { IsBoolean, IsEmail, IsString, Length, Matches, MaxLength } from "class-validator";

export class UpdateProfileDto {
  @IsString()
  @MaxLength(Constants.NAME_LENGTH)
  name: string;

  @IsString()
  @IsEmail()
  @MaxLength(Constants.EMAIL_MAX_LENGTH)
  email: string;

  @IsString()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).*$/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  })
  @Length(Constants.PASSWORD_MIN_LENGTH, Constants.PASSWORD_MAX_LENGTH)
  password: string;

  @IsString()
  @Length(Constants.NUMBER_LENGTH)
  number: string;

  @IsString()
  @MaxLength(Constants.ADDRESS_LENGTH)
  address: string;

  @IsBoolean()
  is2FAEnabled?: boolean;

  @IsString()
  userType?: string;
}
