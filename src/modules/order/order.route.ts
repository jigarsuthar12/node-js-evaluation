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
    this.router.post("/", this.authMiddleware.auth, this.orderController.placeOrder);
    this.router.get("/", this.authMiddleware.auth, this.orderController.pastOrder);
    this.router.get("/:orderId", this.authMiddleware.auth, this.orderController.getDetails);
    this.router.get("/order-status/:orderId", this.authMiddleware.auth, this.orderController.getOrderStatus);
    this.router.put("/cancel-order/:orderId", this.authMiddleware.auth, this.orderController.cancelOrder);
    this.router.put("/update-order-status/:orderId", this.authMiddleware.auth, this.authMiddleware.isAdmin, this.orderController.updateStatus);
  }
}
