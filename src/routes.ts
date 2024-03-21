import { AuthRouter } from "@modules/auth";
import { ProductRouter } from "@modules/product";
import { Router } from "express";

export default class Routes {
  public configure() {
    const router = Router();
    router.use("/auth", new AuthRouter().router);
    router.use("/product", new ProductRouter().router);
    router.all("/*", (req, res) =>
      res.status(404).json({
        error: "ERR_URL_NOT_FOUND",
      }),
    );
    return router;
  }
}
