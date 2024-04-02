import { InitRepository, InjectRepositories } from "@helpers";
import { TRequest, TResponse } from "@types";
import { ReviewEntity } from "entities/review.entity";
import { Repository } from "typeorm";
import { CreateReviewDto } from "./dto";

interface IReviewQueryParams {
  productId?: number;
}

export class ReviewController {
  @InitRepository(ReviewEntity)
  reviewRepository: Repository<ReviewEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public create = async (req: TRequest<CreateReviewDto>, res: TResponse) => {
    const { rating, description } = req.dto as CreateReviewDto;
    const { productId } = req.params as IReviewQueryParams;

    const review = this.reviewRepository.create({ description, rating, productId: Number(productId), userId: req.me.id });
    await this.reviewRepository.save(review);
    res.status(201).json({ msg: "REVIEW ADDED", review });
  };
}
