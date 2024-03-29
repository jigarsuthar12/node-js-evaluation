import { env } from "@configs";
import { ProductEntity, ResetPasswordRequestEntity, TwoFactorAuthRequestEntity, UserEntity } from "@entities";
import { HandleUnhandledPromise } from "@helpers";
import { json, urlencoded } from "body-parser";
import compression from "compression";
import { DB } from "configs/db";
import dotenv from "dotenv";
import { CartEntity } from "entities/cart.entity";
import { CartItemEntity } from "entities/cartItem.entity";
import { OrderEntity } from "entities/order.entity";
import { ReviewEntity } from "entities/review.entity";
import express from "express";
import helmet from "helmet";
import { EnvValidator } from "helpers/env-validator.helper";
import { Log } from "helpers/logger.helper";
import methodOverride from "method-override";
import morgan from "morgan";
import "reflect-metadata";
import Routes from "./routes";

dotenv.config();

export default class App {
  protected app: express.Application;

  private logger = Log.getLogger();

  public init() {
    // init DB.
    DB.init({
      type: "mysql",
      host: env.dbHost,
      port: 3306,
      username: env.dbUser,
      password: env.dbPassword,
      database: env.dbName,
      entities: [UserEntity, TwoFactorAuthRequestEntity, ResetPasswordRequestEntity, ProductEntity, CartEntity, ReviewEntity, OrderEntity, CartItemEntity],
    });

    // Handle Unhandled Promise Rejections
    new HandleUnhandledPromise().init();

    // Validate ENV file
    EnvValidator.validate(env);

    // Init Express
    this.app = express();

    // Security
    this.app.use(helmet());
    this.app.use(morgan("tiny"));
    this.app.use(compression());

    // Enable DELETE and PUT
    this.app.use(methodOverride());

    // Body Parsing
    this.app.use(json({ limit: "50mb" }));
    this.app.use(urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

    // Routing
    const routes = new Routes();
    this.app.use("/", routes.configure());

    // Start server
    this.app.listen(process.env.PORT, () => {
      this.logger.info(`The server is running in port localhost: ${process.env.PORT}`);
    });
  }

  public getExpresApp() {
    return this.app;
  }
}
