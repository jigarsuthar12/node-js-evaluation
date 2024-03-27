import { InjectCls, SFRouter, Validator } from "@helpers";
import { AuthMiddleware } from "@middlewares";
import { RouterDelegates } from "@types";
import { CreateReviewDto } from "./dto";
import { ReviewController } from "./review.controller";

export class ReviewRouter extends SFRouter implements RouterDelegates {
  @InjectCls(ReviewController)
  private reviewController: ReviewController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.post("/:productId", Validator.validate(CreateReviewDto), this.authMiddleware.auth, this.reviewController.create);
  }
}
