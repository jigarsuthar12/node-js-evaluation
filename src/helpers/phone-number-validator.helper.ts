import PhoneNumber from "libphonenumber-js";
import { Log } from "./logger.helper";

export class PhoneNumberValidator {
  public static logger = Log.getLogger();

  // This function is responsible for check country code in number
  public static validate(phoneNumber: string): boolean {
    const parsedNumber = PhoneNumber(phoneNumber);

    if (parsedNumber) {
      return true;
    }
    return false;
  }
}
