import { ProductEntity } from "@entities";
import { InitRepository, InjectRepositories } from "@helpers";
import { TRequest, TResponse } from "@types";
import { Repository } from "typeorm";
import { CreateProductDto } from "./dto";

export class ProductController {
  @InitRepository(ProductEntity)
  productRepository: Repository<ProductEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public create = async (req: TRequest<CreateProductDto>, res: TResponse) => {
    const product = this.productRepository.create(req.dto);
    await this.productRepository.save(product);

    return res.status(201).json({ msg: "PRODUCT_CREATED" });
  };
}
