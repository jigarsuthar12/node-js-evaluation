import { CartEntity, CartItemEntity, OrderEntity, OrderItemEntity, ProductEntity, ReviewEntity, UserEntity } from "@entities";
import { InitRepository, InjectRepositories } from "@helpers";
import { Status, TRequest, TResponse } from "@types";
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

  @InitRepository(CartItemEntity)
  cartItemRepository: Repository<CartItemEntity>;

  @InitRepository(OrderItemEntity)
  orderItemRepository: Repository<OrderItemEntity>;

  @InitRepository(CartEntity)
  cartRepository: Repository<CartEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public pastOrder = async (req: TRequest, res: TResponse) => {
    const orders = await this.orderRepository.find({ where: { userId: req.me.id } });
    const mappedOrders = await Promise.all(
      orders.map(async item => {
        const orderItems = await this.orderItemRepository.find({ where: { orderId: item.id } });
        const allProducts = await Promise.all(
          orderItems.map(async orderItem => {
            const products = await this.productRepository.find({ where: { id: orderItem.productId } });
            const mappedProducts = await Promise.all(
              products.map(async productItem => {
                const reviews = await this.reviewRepository.find({ where: { productId: productItem.id } });
                const updatedReviews = await Promise.all(
                  reviews.map(async reviewItem => {
                    const user = await this.userRepository.findOne({ where: { id: reviewItem.userId } });
                    return { ...reviewItem, username: user.name };
                  }),
                );
                return { ...productItem, reviews: updatedReviews };
              }),
            );
            return { product: mappedProducts };
          }),
        );

        return { ...item, allProducts };
      }),
    );
    const user = await this.userRepository.findOne({ where: { id: req.me.id } });
    return res.status(200).json({ msg: "ALL ORDERS", Orders: mappedOrders, username: user.name });
  };

  public placeOrder = async (req: TRequest, res: TResponse) => {
    const placeOrderCart = await this.cartRepository.findOne({ where: { userId: req.me.id } });
    const placeOrderItems = await this.cartItemRepository.find({ where: { cartId: placeOrderCart.id } });

    const order = await this.orderRepository.create({ userId: 1 });
    await this.orderRepository.save(order);

    await Promise.all(
      placeOrderItems.map(async item => {
        const orderItems = await this.orderItemRepository.create({ orderId: order.id, productId: item.productId, quantity: item.quantity });
        await this.orderItemRepository.save(orderItems);
      }),
    );
    await this.cartItemRepository.delete({ cartId: placeOrderCart.id });

    return res.status(200).json({ msg: "ORDER_CREATED" });
  };

  public getDetails = async (req: TRequest, res: TResponse) => {
    const { orderId } = req.params as ReviewParams;
    const order = await this.orderRepository.findOne({ where: { id: orderId, userId: req.me.id } });
    const orderItems = await this.orderItemRepository.find({ where: { orderId: order.id } });

    const allProducts = await Promise.all(
      orderItems.map(async item => {
        const product = await this.productRepository.findOne({ where: { id: item.productId } });
        const reviews = await this.reviewRepository.find({ where: { productId: product.id } });
        const mapppedReviews = await Promise.all(
          reviews.map(async mappedreview => {
            const user = await this.userRepository.findOne({ where: { id: mappedreview.userId } });
            return { ...item, username: user.name };
          }),
        );

        return { ...item, product, review: mapppedReviews };
      }),
    );

    const user = await this.userRepository.findOne({ where: { id: order.userId } });
    return res.status(200).json({ msg: "GOT_ORDER", ...order, allProducts, username: user.name });
  };

  public getOrderStatus = async (req: TRequest, res: TResponse) => {
    const { orderId } = req.params as ReviewParams;
    const orderStatus = await this.orderRepository.findOne({ where: { id: orderId, userId: req.me.id } });
    return res.status(200).json({ msg: "ORDER_STATUS", status: orderStatus.status });
  };

  public cancelOrder = async (req: TRequest, res: TResponse) => {
    const { orderId } = req.params as ReviewParams;
    await this.orderRepository.update({ id: Number(orderId), userId: req.me.id }, { cancleFlag: true });
    await this.orderRepository.update({ id: Number(orderId) }, { status: Status.CANCELLED });
    return res.status(200).json({ msg: "ORDER_CANCELLED!!" });
  };

  public updateStatus = async (req: TRequest, res: TResponse) => {
    const { orderId } = req.params as ReviewParams;
    await this.orderRepository.update({ id: Number(orderId) }, { status: Status.PROCESSING });

    return res.status(200).json({ msg: "STATUS_UPDATED" });
  };
}
