import { UserEntity } from "@entities";
import { Bcrypt, InitRepository, InjectRepositories } from "@helpers";
import { TRequest, TResponse } from "@types";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto";

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
}
