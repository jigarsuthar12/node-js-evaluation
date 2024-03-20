import { UserEntity } from "@entities";
import { Bcrypt, InitRepository, InjectRepositories, JwtHelper } from "@helpers";
import { TRequest, TResponse } from "@types";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto";
import { SignInDto } from "./dto/signin.dto";

export class AuthController {
  @InitRepository(UserEntity)
  userRepository: Repository<UserEntity>;

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
}
