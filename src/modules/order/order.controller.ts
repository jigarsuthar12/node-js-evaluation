import { InitRepository, InjectRepositories } from "@helpers";
import { TRequest, TResponse } from "@types";
import { OrderEntity } from "entities/order.entity";
import { Repository } from "typeorm";

interface ReviewParams {
  productId?: number;
}

export class OrderController {
  @InitRepository(OrderEntity)
  orderRepository: Repository<OrderEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public placeOrder = async (req: TRequest, res: TResponse) => {
    const { productId } = req.params as ReviewParams;
    const order = await this.orderRepository.create({ userId: req.me.id, productId: Number(productId) });
    await this.orderRepository.save(order);

    return res.status(201).json({ msg: "ORDER_CREATED" });
  };
}
