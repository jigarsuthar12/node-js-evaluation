import { Constants } from "@configs";
import { ResetPasswordRequestEntity, TwoFactorAuthRequestEntity, UserEntity } from "@entities";
import { Bcrypt, GenerateOTP, InitRepository, InjectRepositories, JwtHelper, Notification } from "@helpers";
import { TRequest, TResponse } from "@types";
import moment from "moment";
import { MoreThanOrEqual, Repository } from "typeorm";
import { CreateUserDto, ResetPasswordDto, SendTwoFactorDto, SignInDto, UpdateProfileDto, VerifyTwoFactorDto } from "./dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";

export class AuthController {
  @InitRepository(UserEntity)
  userRepository: Repository<UserEntity>;

  @InitRepository(ResetPasswordRequestEntity)
  resetPasswordRequest: Repository<ResetPasswordRequestEntity>;

  @InitRepository(TwoFactorAuthRequestEntity)
  twoFactorAuthRequestEntity: Repository<TwoFactorAuthRequestEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public create = async (req: TRequest<CreateUserDto>, res: TResponse) => {
    const { email, name, number, password, address, is2FAEnabled, userType } = req.dto as CreateUserDto;

    const findEmail = await this.userRepository.findOne({ where: { email } });
    if (findEmail) {
      return res.status(404).json({ msg: "CAN_NOT_ENTER_DUPLICATE_EMAIL" });
    }

    const findNumber = await this.userRepository.findOne({ where: { number } });
    if (findNumber) {
      return res.status(404).json({ msg: "CAN_NOT_ENTER_DUPLICATE_NUMBER" });
    }

    const hashpassword = await Bcrypt.hash(password);

    const user = await this.userRepository.create({ email, name, number, password: hashpassword, address, is2FAEnabled, userType });
    await this.userRepository.save(user);

    return res.status(201).json({ msg: "USER_CREATED" });
  };

  public signIn = async (req: TRequest<SignInDto>, res: TResponse) => {
    const { email, number, password } = req.dto;

    const user = await this.userRepository.findOne({
      where: [{ email }, { number }],
      select: ["email", "id", "number", "password", "name", "userType"],
    });

    if (!user) {
      return res.status(400).json({ error: "Please verify email account! or please verify your number" });
    }

    const compare = await Bcrypt.verify(password, user.password);

    if (!compare) {
      return res.status(400).json({ error: "Please check your password!" });
    }

    const token = JwtHelper.encode({ id: user.id });
    return res.status(200).json({ token });
  };

  public sendTwoFactor = async (req: TRequest<SendTwoFactorDto>, res: TResponse) => {
    const { email } = req.dto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: ["id", "email"],
    });
    const otp = GenerateOTP.generate();
    const hashOTP = await Bcrypt.hash(otp.toString());

    const twoFactorAuth = await this.twoFactorAuthRequestEntity.create({ userId: req.me.id, hashCode: hashOTP });
    await this.twoFactorAuthRequestEntity.save(twoFactorAuth);

    const message = `Use this OTP: ${otp} for 2FA authentication. Keep it secret and don't share it with anyone.`;

    try {
      await Notification.email("sign-in", message, [user.email]);

      return res.status(200).json({ msg: "2FA_SENT" });
    } catch (err) {
      return res.status(400).json({ error: err });
    }
  };

  public verifyTwoFactor = async (req: TRequest<VerifyTwoFactorDto>, res: TResponse) => {
    const { code } = req.dto;
    const otpExpiryDate = moment().subtract(Constants.OTP_EXPIRY, "seconds").toDate();

    const userHashOtp = await this.twoFactorAuthRequestEntity.findOne({
      where: {
        userId: req.me.id,
        createdAt: MoreThanOrEqual(otpExpiryDate),
      },
      order: {
        createdAt: "DESC",
      },
      select: ["hashCode"],
    });

    if (!userHashOtp) {
      return res.status(400).json({ error: "OTP has expired, please try again!" });
    }

    const codeStr = code.toString();
    const compare = await Bcrypt.verify(codeStr, userHashOtp.hashCode);

    if (compare) {
      await this.userRepository.update(req.me.id, { is2FAEnabled: true });
      await this.twoFactorAuthRequestEntity.delete({ userId: req.me.id });
    } else {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    return res.status(200).json({ msg: "2FA_VERIFY" });
  };

  public forgotPassword = async (req: TRequest<ForgotPasswordDto>, res: TResponse) => {
    const { email } = req.dto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: ["id", "email", "name"],
    });

    if (!user) {
      return res.status(400).json({ error: "Please verify email account!" });
    }

    const resetPasswordRequest = await this.resetPasswordRequest.create({ userId: user.id });
    await this.resetPasswordRequest.save(resetPasswordRequest);

    const emailData = `<a>localhost:8080/reset-password/${resetPasswordRequest.id}</a>`;

    try {
      await Notification.email("reset-password", emailData, [user.email]);
      return res.status(200).json({ msg: "RESET_PASSWORD_LINK" });
    } catch (err) {
      return res.status(400).json({ error: err });
    }
  };

  public resetPassword = async (req: TRequest<ResetPasswordDto>, res: TResponse) => {
    const { password } = req.dto as ResetPasswordDto;
    const { token } = req.params;

    const resetPassExpiryDate = moment().subtract(Constants.RESET_PASS_EXPIRY, "seconds").toDate();

    const resetPasswordRequest = await this.resetPasswordRequest.findOne({
      where: {
        id: parseInt(token, 10),
        createdAt: MoreThanOrEqual(resetPassExpiryDate),
      },
      order: {
        createdAt: "DESC",
      },
    });

    if (resetPasswordRequest) {
      const hashPassword = await Bcrypt.hash(password);
      await this.userRepository.update(resetPasswordRequest.userId, { password: hashPassword });
      await this.resetPasswordRequest.delete(token);
    } else {
      return res.status(400).json({ error: "Request invalid or expired, please try again!" });
    }

    return res.status(200).json({ msg: "PASSWORD_UPDATE" });
  };

  public updateProfile = async (req: TRequest<UpdateProfileDto>, res: TResponse) => {
    const { email, name, number, password, address, is2FAEnabled } = req.dto as UpdateProfileDto;

    if (email) {
      const findEmail = await this.userRepository.findOne({ where: { email } });
      if (findEmail) {
        return res.status(404).json({ msg: "CAN_NOT_ENTER_DUPLICATE_EMAIL" });
      }
    }
    if (number) {
      const findNumber = await this.userRepository.findOne({ where: { number } });
      if (findNumber) {
        return res.status(404).json({ msg: "CAN_NOT_ENTER_DUPLICATE_NUMBER" });
      }
    }
    if (password) {
      const hashpassword = await Bcrypt.hash(password);
      await this.userRepository.update({ id: Number(req.me.id) }, { email, name, password: hashpassword, number, address, is2FAEnabled });
    }

    await this.userRepository.update({ id: Number(req.me.id) }, { email, name, number, address, is2FAEnabled });
    return res.status(200).json({ msg: "PROFILE_UPDATED" });
  };
}
