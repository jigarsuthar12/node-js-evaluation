import { CartEntity, CartItemEntity, OrderEntity, OrderItemEntity, ProductEntity, ReviewEntity, UserEntity } from "@entities";
import { InitRepository, InjectRepositories } from "@helpers";
import { EStatus, TRequest, TResponse } from "@types";
import { Repository } from "typeorm";

interface IReviewParams {
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
    const orders = await this.orderRepository.find({
      relations: {
        orderItem: {
          product: {
            reviews: {
              user: true,
            },
          },
        },
      },
      where: { userId: req.me.id },
    });
    if (!orders) {
      return res.status(404).json({ msg: "YOU_HAVE_NO_ORDERS" });
    }
    // Calculate average rating for each product with reviews
    const productsWithAvgRating = orders.map(item => {
      if (!item.orderItem[0].product || !item.orderItem[0].product.reviews || item.orderItem[0].product.reviews.length === 0) {
        return { ...item.orderItem[0], product: { ...item.orderItem[0].product, avgRating: null } };
      }

      const totalRating = item.orderItem[0].product.reviews.reduce((acc, review) => acc + review.rating, 0);
      const avgRating = totalRating / item.orderItem[0].product.reviews.length;

      return {
        ...item.orderItem[0],
        product: {
          ...item.orderItem[0].product,
          avgRating: parseFloat(avgRating.toFixed(1)),
        },
      };
    });

    return res.status(200).json({ msg: "ALl_ORDERS", pastOrders: productsWithAvgRating });
  };

  public placeOrder = async (req: TRequest, res: TResponse) => {
    const placeOrderCart = await this.cartRepository.findOne({ where: { userId: req.me.id } });
    const placeOrderItems = await this.cartItemRepository.find({ where: { cartId: placeOrderCart.id } });

    const order = await this.orderRepository.create({ userId: req.me.id });
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
    const { orderId } = req.params as IReviewParams;

    const order = await this.orderRepository.find({ where: { id: orderId, userId: req.me.id } });
    const orderItem = await this.orderItemRepository.find({
      relations: {
        product: {
          reviews: {
            user: true,
          },
        },
        order: true,
      },
      where: {
        orderId: order[0].id,
      },
    });

    // Calculate average rating for each product with reviews
    const productsWithAvgRating = orderItem.map(orderItems => {
      if (!orderItems.product || !orderItems.product.reviews || orderItems.product.reviews.length === 0) {
        return { ...orderItems, product: { ...orderItems.product, avgRating: null } };
      }

      const totalRating = orderItems.product.reviews.reduce((acc, review) => acc + review.rating, 0);
      const avgRating = totalRating / orderItems.product.reviews.length;

      return {
        ...orderItems,
        product: {
          ...orderItems.product,
          avgRating: parseFloat(avgRating.toFixed(1)),
        },
      };
    });
    return res.status(200).json({ msg: "GOT_ORDER", ...productsWithAvgRating });
  };

  public getOrderStatus = async (req: TRequest, res: TResponse) => {
    const { orderId } = req.params as IReviewParams;
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ msg: "Client Side error wrong orderId" });
    }
    const orderStatus = await this.orderRepository.findOne({ where: { id: orderId, userId: req.me.id } });
    return res.status(200).json({ msg: "ORDER_STATUS", status: orderStatus.status });
  };

  public cancelOrder = async (req: TRequest, res: TResponse) => {
    const { orderId } = req.params as IReviewParams;
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ msg: "Client Side error wrong orderId" });
    }
    await this.orderRepository.update({ id: Number(orderId), userId: req.me.id }, { cancleFlag: true });
    await this.orderRepository.update({ id: Number(orderId) }, { status: EStatus.CANCELLED });
    return res.status(200).json({ msg: "ORDER_CANCELLED!!" });
  };

  public updateStatus = async (req: TRequest, res: TResponse) => {
    const { orderId } = req.params as IReviewParams;
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ msg: "Client Side error wrong orderId" });
    }
    await this.orderRepository.update({ id: Number(orderId) }, { status: EStatus.PROCESSING });

    return res.status(200).json({ msg: "STATUS_UPDATED" });
  };
}
