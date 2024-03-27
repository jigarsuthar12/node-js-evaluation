import { CartEntity, ProductEntity, ReviewEntity, UserEntity } from "@entities";
import { InitRepository, InjectRepositories } from "@helpers";
import { TRequest, TResponse } from "@types";
import { Repository } from "typeorm";

interface ReviewParams {
  productId?: number;
}

export class CartController {
  @InitRepository(CartEntity)
  cartRepository: Repository<CartEntity>;

  @InitRepository(UserEntity)
  userRepository: Repository<UserEntity>;

  @InitRepository(ReviewEntity)
  reviewRepository: Repository<ReviewEntity>;

  @InitRepository(ProductEntity)
  productRepository: Repository<ProductEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public get = async (req: TRequest, res: TResponse) => {
    const carts = await this.cartRepository.find({ where: { userId: req.me.id } });
    const updatedCarts = await Promise.all(
      carts.map(async item => {
        const product = await this.productRepository.find({
          where: { id: item.productId },
        });
        const updatedProduct = await Promise.all(
          product.map(async productItem => {
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

        return { ...item, product: updatedProduct };
      }),
    );
    const user = await this.userRepository.findOne({ where: { id: req.me.id } });
    return res.status(200).json({ msg: "GOT_CART_ITEMS", Cart: updatedCarts, username: user.name });
  };

  public create = async (req: TRequest, res: TResponse) => {
    const { productId } = req.params as ReviewParams;
    const cart = await this.cartRepository.create({ productId: Number(productId), userId: req.me.id });
    await this.cartRepository.save(cart);

    return res.status(201).json({ msg: "CART_ADDED" });
  };

  public deleteFromCart = async (req: TRequest, res: TResponse) => {
    const { productId } = req.params as ReviewParams;
    await this.cartRepository.delete({ productId, userId: req.me.id });
    return res.status(200).json({ msg: "PRODUCT_FROM_CART_DELETED" });
  };
}
