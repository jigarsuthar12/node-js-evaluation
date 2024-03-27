import { ProductEntity } from "@entities";
import { InitRepository, InjectRepositories } from "@helpers";
import { TRequest, TResponse } from "@types";
import { Repository } from "typeorm";
import { CreateProductDto, UpdateProductDto } from "./dto";

export class ProductController {
  @InitRepository(ProductEntity)
  productRepository: Repository<ProductEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public create = async (req: TRequest<CreateProductDto>, res: TResponse) => {
    const { name, price, imageUrl, description, discount, category } = req.dto as CreateProductDto;
    const product = this.productRepository.create({ name, price, imageUrl, description, discount, category });
    await this.productRepository.save(product);

    return res.status(201).json({ msg: "PRODUCT_CREATED" });
  };

  public update = async (req: TRequest<UpdateProductDto>, res: TResponse) => {
    const { name, price, imageUrl, description, discount, category } = req.dto as UpdateProductDto;
    const { productId } = req.params;
    this.productRepository.update({ id: parseInt(productId, 10) }, { name, price, imageUrl, description, discount, category });

    res.status(200).json({ msg: "PRODUCT_UPDATED" });
  };
}
