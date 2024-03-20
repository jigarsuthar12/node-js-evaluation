export class Constants {
  public static readonly FROM_EMAIL = "no-reply@example.com";

  public static readonly PAGER = {
    page: 1,
    limit: 2000,
  };

  public static readonly BCRYPT_SALT_ROUND = 10;

  public static readonly NUMBER_LENGTH = 10;

  public static readonly NAME = 255;

  public static readonly EMAIL_MAX_LENGTH = 255;

  public static readonly VERIFICATION_CODE_MAX_LENGTH = 6;

  public static readonly PASSWORD_MAX_LENGTH = 255;

  public static readonly PASSWORD_MIN_LENGTH = 6;

  public static readonly RESET_PASS_EXPIRY = 900;

  public static readonly OTP_EXPIRY = 300;

  public static readonly OTP_LENGTH = 6;

  public static readonly ADDRESS_LENGTH = 255;
}
