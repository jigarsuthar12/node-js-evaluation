import { InjectCls, SFRouter } from "@helpers";
import { AuthMiddleware } from "@middlewares";
import { RouterDelegates } from "@types";
import { CartController } from "./cart.controller";

export class CartRouter extends SFRouter implements RouterDelegates {
  @InjectCls(CartController)
  private cartController: CartController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.post("/:productId", this.authMiddleware.auth, this.cartController.create);
  }
}
