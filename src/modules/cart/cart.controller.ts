import { CartEntity } from "@entities";
import { InitRepository, InjectRepositories } from "@helpers";
import { TRequest, TResponse } from "@types";
import { Repository } from "typeorm";

interface ReviewQueryParams {
  productId?: number;
}

export class CartController {
  @InitRepository(CartEntity)
  cartRepository: Repository<CartEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public create = async (req: TRequest, res: TResponse) => {
    const { productId } = req.params as ReviewQueryParams;
    const cart = await this.cartRepository.create({ productId: Number(productId), userId: req.me.id });
    await this.cartRepository.save(cart);

    return res.status(201).json({ msg: "CART_ADDED" });
  };
}
