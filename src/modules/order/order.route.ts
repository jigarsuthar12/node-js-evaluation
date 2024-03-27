import { InjectCls, SFRouter } from "@helpers";
import { AuthMiddleware } from "@middlewares";
import { RouterDelegates } from "@types";
import { OrderController } from "./order.controller";

export class OrderRouter extends SFRouter implements RouterDelegates {
  @InjectCls(OrderController)
  private orderController: OrderController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.post("/:productId", this.authMiddleware.auth, this.orderController.placeOrder);
  }
}
