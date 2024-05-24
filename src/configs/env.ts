import { IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator";
import dotenv from "dotenv";

dotenv.config();

class Env {
  @IsInt()
  @Min(2000)
  @Max(9999)
  public port: number;

  @IsNotEmpty()
  public dbName: string;

  @IsNotEmpty()
  public dbHost: string;

  @IsNotEmpty()
  public dbUser: string;

  @IsInt()
  @Min(2000)
  @Max(9999)
  public dbPort: number;

  @IsNotEmpty()
  public dbPassword: string;

  @IsNotEmpty()
  @IsInt()
  public smtpPort: number;

  @IsNotEmpty()
  @IsString()
  public smtpHost: string;

  @IsNotEmpty()
  @IsString()
  public smtpUser: string;

  @IsNotEmpty()
  @IsString()
  public smtpPass: string;

  @IsNotEmpty()
  @IsString()
  public domain: string;

  @IsNotEmpty()
  @IsString()
  public secretKey: string;

  @IsNotEmpty()
  @IsString()
  public endPointSecret: string;
}

export const env = new Env();

env.dbName = process.env.DB_NAME;
env.dbHost = process.env.DB_HOST;
env.dbUser = process.env.DB_USER;
env.dbPort = +(process.env.DB_PORT || 3306);
env.dbPassword = process.env.DB_PASSWORD;
env.port = +process.env.PORT;
env.smtpHost = process.env.SMTP_HOST;
env.smtpPort = +process.env.SMTP_PORT;
env.smtpUser = process.env.SMTP_USER;
env.smtpPass = process.env.SMTP_PASS;
env.domain = process.env.DOMAIN;
env.secretKey = process.env.STRIPE_SECRET_KEY;
env.endPointSecret = process.env.ENDPOINT_SECRET;
