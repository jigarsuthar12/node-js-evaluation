import { ProductEntity, ReviewEntity, UserEntity } from "@entities";
import { InitRepository, InjectRepositories } from "@helpers";
import { Status, TRequest, TResponse } from "@types";
import { OrderEntity } from "entities/order.entity";
import { Repository } from "typeorm";

interface ReviewParams {
  productId?: number;
  orderId?: number;
}

export class OrderController {
  @InitRepository(ProductEntity)
  productRepository: Repository<ProductEntity>;

  @InitRepository(ReviewEntity)
  reviewRepository: Repository<ReviewEntity>;

  @InitRepository(UserEntity)
  userRepository: Repository<UserEntity>;

  @InitRepository(OrderEntity)
  orderRepository: Repository<OrderEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public pastOrder = async (req: TRequest, res: TResponse) => {
    const orders = await this.orderRepository.find({ where: { userId: req.me.id } });
    const mappedOrders = await Promise.all(
      orders.map(async item => {
        const products = await this.productRepository.find({ where: { id: item.productId } });
        const mappedProducts = await Promise.all(
          products.map(async productItem => {
            const reviews = await this.reviewRepository.find({ where: { productId: productItem.id } });
            const updatedReviews = await Promise.all(
              reviews.map(async reviewItem => {
                const user = await this.userRepository.findOne({ where: { id: reviewItem.userId } });
                return { ...reviewItem, username: user.name };
              }),
            );
            return { ...item, reviews: updatedReviews };
          }),
        );
        return { ...item, product: mappedProducts };
      }),
    );
    const user = await this.userRepository.findOne({ where: { id: req.me.id } });
    return res.status(200).json({ msg: "ALL ORDERS", Orders: mappedOrders, username: user.name });
  };

  public placeOrder = async (req: TRequest, res: TResponse) => {
    const { productId } = req.params as ReviewParams;
    const order = await this.orderRepository.create({ userId: req.me.id, productId: Number(productId) });
    await this.orderRepository.save(order);

    return res.status(201).json({ msg: "ORDER_CREATED" });
  };

  public getDetails = async (req: TRequest, res: TResponse) => {
    const { orderId } = req.params as ReviewParams;
    const order = await this.orderRepository.findOne({ where: { id: orderId, userId: req.me.id } });
    const product = await this.productRepository.findOne({ where: { id: order.productId } });
    const reviews = await this.reviewRepository.find({ where: { productId: product.id } });
    const mapppedReviews = await Promise.all(
      reviews.map(async item => {
        const user = await this.userRepository.findOne({ where: { id: item.userId } });
        return { ...item, username: user.name };
      }),
    );
    const user = await this.userRepository.findOne({ where: { id: order.userId } });
    return res.status(200).json({ msg: "GOT_ORDER", ...order, product, reviews: mapppedReviews, username: user.name });
  };

  public getOrderStatus = async (req: TRequest, res: TResponse) => {
    const { orderId } = req.params as ReviewParams;
    const orderStatus = await this.orderRepository.findOne({ where: { id: orderId, userId: req.me.id } });
    return res.status(200).json({ msg: "ORDER_STATUS", status: orderStatus.status });
  };

  public cancelOrder = async (req: TRequest, res: TResponse) => {
    const { orderId } = req.params as ReviewParams;
    await this.orderRepository.update({ id: Number(orderId), userId: req.me.id }, { cancleFlag: true });
    return res.status(200).json({ msg: "ORDER_CANCELLED!!" });
  };

  public updateStatus = async (req: TRequest, res: TResponse) => {
    const { orderId } = req.params as ReviewParams;
    await this.orderRepository.update({ id: Number(orderId) }, { status: Status.PROCESSING });

    return res.status(200).json({ msg: "STATUS_UPDATED" });
  };
}
