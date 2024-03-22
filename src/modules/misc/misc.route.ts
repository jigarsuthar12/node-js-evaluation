import { InjectCls, SFRouter } from "@helpers";
import { RouterDelegates } from "@types";
import { MiscController } from "./misc.controller";

export class MiscRouter extends SFRouter implements RouterDelegates {
  @InjectCls(MiscController)
  private miscController: MiscController;

  initRoutes() {
    this.router.get("/", this.miscController.getEnums);
  }
}
