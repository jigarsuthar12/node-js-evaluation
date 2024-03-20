import { Constants } from "@configs";
import bcrypt from "bcrypt";

export class Bcrypt {
  public static async hash(password: string): Promise<string> {
    const hashPassword = await bcrypt.hash(password, Constants.BCRYPT_SALT_ROUND);
    return hashPassword;
  }

  public static async verify(plainTextPassword: string, hashPassword: string): Promise<boolean> {
    const verify = await bcrypt.compare(plainTextPassword, hashPassword);
    return verify;
  }
}
