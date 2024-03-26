import { InjectCls, SFRouter, Validator } from "@helpers";
import { AuthMiddleware } from "@middlewares";
import { RouterDelegates } from "@types";
import { CreateProductDto, UpdateProductDto } from "./dto";
import { ProductController } from "./index";

export class ProductRouter extends SFRouter implements RouterDelegates {
  @InjectCls(ProductController)
  private productController: ProductController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.post("/create-product", Validator.validate(CreateProductDto), this.authMiddleware.auth, this.authMiddleware.isAdmin, this.productController.create);
    this.router.put("/update-product/:productId", Validator.validate(UpdateProductDto), this.authMiddleware.auth, this.authMiddleware.isAdmin, this.productController.update);
    this.router.get("/", this.productController.get);
    this.router.get("/get-trending-list", this.productController.getTrendingList);
  }
}
