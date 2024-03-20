import { Constants, env } from "@configs";
import nodemailer from "nodemailer";
import { Log } from "./logger.helper";

export class Notification {
  public static async email(templateName: string, dynamicData: string, to: string[]) {
    const logger = Log.getLogger();
    const emailTransport = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    });
    const sentEmail = await emailTransport.sendMail({
      from: Constants.FROM_EMAIL,
      to,
      subject: "Signin succeeded",
      text: dynamicData,
    });

    logger.info("Email sent successfully", { emails: to });

    return sentEmail;
  }
}
