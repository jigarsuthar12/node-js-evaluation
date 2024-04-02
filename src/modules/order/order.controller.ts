import { CartEntity, CartItemEntity, OrderEntity, OrderItemEntity, ProductEntity, ReviewEntity, UserEntity } from "@entities";
import { InitRepository, InjectRepositories, Log } from "@helpers";
import { EStatus, TRequest, TResponse } from "@types";
import { Request, Response } from "express";
import Stripe from "stripe";
import { Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";

const stripe = new Stripe("sk_test_51OmF3lSHazoMtA3eZ5dpyqtYUlN6Au5Obw3PM12CH01cffI0bYEszS19ObQRLfgqs0V2HBrZFisqRugJbr20uppE00JJopejYU");
const endpointSecret = "whsec_dixjM5cXgpUrSqggT0eSzgKvyHXN3sHn";
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

  public logger = Log.getLogger();

  public pastOrder = async (req: TRequest, res: TResponse) => {
    const orders = await this.orderRepository.find({ where: { userId: req.me.id } });
    if (!orders) {
      return res.status(404).json({ msg: "YOU_HAVE_NO_ORDERS" });
    }
    const mappedOrders = await Promise.all(
      orders.map(async item => {
        const orderItems = await this.orderItemRepository.find({ where: { orderId: item.id } });
        const allProducts = await Promise.all(
          orderItems.map(async orderItem => {
            const products = await this.productRepository.find({ where: { id: orderItem.productId } });
            const mappedProducts = await Promise.all(
              products.map(async productItem => {
                const reviews = await this.reviewRepository.find({ where: { productId: productItem.id } });
                const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
                const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;
                const updatedReviews = await Promise.all(
                  reviews.map(async reviewItem => {
                    const user = await this.userRepository.findOne({ where: { id: reviewItem.userId } });
                    return { ...reviewItem, username: user.name };
                  }),
                );
                return { ...productItem, reviews: updatedReviews, avgRating };
              }),
            );
            return { quantity: orderItem.quantity, product: mappedProducts };
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

    const order = await this.orderRepository.create({ userId: req.me.id, status: EStatus.PROCESSING });
    await this.orderRepository.save(order);

    const result = await this.cartItemRepository
      .createQueryBuilder("cartItem")
      .select("SUM(product.price * cartItem.quantity)", "totalPrice")
      .leftJoin("cartItem.product", "product")
      .where("cartItem.cartId = :cartId", { cartId: placeOrderCart.id })
      .getRawOne();

    const payment = result.totalPrice;
    const uuid = uuidv4();
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: payment * 100,
        currency: "INR",
      },
      {
        idempotencyKey: uuid,
      },
    );
    await this.orderRepository.update({ userId: req.me.id, id: order.id }, { paymentKey: uuid });

    await Promise.all(
      placeOrderItems.map(async item => {
        const orderItems = await this.orderItemRepository.create({ orderId: order.id, productId: item.productId, quantity: item.quantity });
        await this.orderItemRepository.save(orderItems);
      }),
    );
    await this.cartItemRepository.delete({ cartId: placeOrderCart.id });

    return res.status(200).json({ msg: "ORDER_CREATED && PAYMENT_SUCCESSFULL" });
  };

  public getDetails = async (req: TRequest, res: TResponse) => {
    const { orderId } = req.params as IReviewParams;
    const order = await this.orderRepository.findOne({ where: { id: orderId, userId: req.me.id } });
    if (!order) {
      return res.status(404).json({ msg: "Client Side error wrong orderId" });
    }
    const orderItems = await this.orderItemRepository.find({ where: { orderId: order.id } });

    const allProducts = await Promise.all(
      orderItems.map(async item => {
        const product = await this.productRepository.findOne({ where: { id: item.productId } });
        const reviews = await this.reviewRepository.find({ where: { productId: product.id } });
        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

        const mapppedReviews = await Promise.all(
          reviews.map(async mappedreview => {
            const user = await this.userRepository.findOne({ where: { id: mappedreview.userId } });
            return { ...item, username: user.name };
          }),
        );

        return { ...item, product, review: mapppedReviews, avgRating };
      }),
    );

    const user = await this.userRepository.findOne({ where: { id: order.userId } });
    return res.status(200).json({ msg: "GOT_ORDER", ...order, allProducts, username: user.name });
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

  public webhook = async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
    // Handle specific event types
    if (event.type === "payment_intent.created") {
      const paymentIntent = event.data.object;
      this.logger.info(`Payment intent created: ${paymentIntent}`);
      await this.orderRepository.update({ paymentKey: event.request.idempotency_key }, { paymentMetadata: paymentIntent, status: EStatus.SHIPPED });
      return res.status(200).json({ msg: "payment is created!" });
    }
    if (event.type === "payment_intent.payment_failed") {
      const paymentFailedIntent = event.data.object;
      this.logger.info("Payment intent failed:", paymentFailedIntent);
      return res.status(404).json({ msg: "Error is there in payment" });
    }

    return res.status(200).json({ recieved: true });
  };
}
