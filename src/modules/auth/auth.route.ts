import { InjectCls, SFRouter, Validator } from "@helpers";
import { AuthMiddleware } from "@middlewares";
import { RouterDelegates } from "@types";
import { AuthController } from "./auth.controller";
import { CreateUserDto } from "./dto";
import { SignInDto } from "./dto/signin.dto";

export class AuthRouter extends SFRouter implements RouterDelegates {
  @InjectCls(AuthController)
  private userController: AuthController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.post("/sign-up", Validator.validate(CreateUserDto), this.userController.create);
    this.router.post("/sign-in", Validator.validate(SignInDto), this.userController.signIn);
  }
}
