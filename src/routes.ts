import { AuthRouter } from "@modules/auth";
import { MiscRouter } from "@modules/misc";
import { ProductRouter } from "@modules/product";
import { ReviewRouter } from "@modules/review";
import { Router } from "express";

export default class Routes {
  public configure() {
    const router = Router();
    router.use("/auth", new AuthRouter().router);
    router.use("/product", new ProductRouter().router);
    router.use("/product-category", new MiscRouter().router);
    router.use("/review", new ReviewRouter().router);
    router.all("/*", (req, res) =>
      res.status(404).json({
        error: "ERR_URL_NOT_FOUND",
      }),
    );
    return router;
  }
}
