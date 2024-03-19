import { UserEntity } from "@entities";
import { InitRepository, InjectRepositories, JwtHelper } from "@helpers";
import { TRequest, TResponse } from "@types";
import { Repository } from "typeorm";

export class AuthMiddleware {
  @InitRepository(UserEntity)
  userRepository: Repository<UserEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public auth = async (req: TRequest, res: TResponse, next: () => void) => {
    if (req.headers && req.headers.authorization) {
      const tokenInfo: any = JwtHelper.decode(req.headers.authorization.toString().replace("Bearer ", ""));

      if (tokenInfo) {
        const user = await this.userRepository.findOne({
          where: { id: tokenInfo.id },
        });
        if (user) {
          req.me = user;
          next();
        } else {
          res.status(401).json({ error: "Unauthorized", code: 401 });
        }
      } else {
        res.status(401).json({ error: "Unauthorized", code: 401 });
      }
    } else {
      res.status(401).json({ error: "Unauthorized", code: 401 });
    }
  };
}
