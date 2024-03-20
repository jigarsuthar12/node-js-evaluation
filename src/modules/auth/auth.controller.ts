import { Constants } from "@configs";
import { ResetPasswordRequestEntity, TwoFactorAuthRequestEntity, UserEntity } from "@entities";
import { Bcrypt, GenerateOTP, InitRepository, InjectRepositories, JwtHelper, Notification } from "@helpers";
import { TRequest, TResponse } from "@types";
import moment from "moment";
import { MoreThanOrEqual, Repository } from "typeorm";
import { CreateUserDto, SendTwoFactorDto, SignInDto, VerifyTwoFactorDto } from "./dto";

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
    req.dto.password = await Bcrypt.hash(req.dto.password);
    const user = await this.userRepository.create(req.dto);
    await this.userRepository.save(user);

    return res.status(200).json({ msg: "USER_CREATED" });
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
    const { number } = req.dto;
    const user = await this.userRepository.findOne({
      where: { number },
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
}
