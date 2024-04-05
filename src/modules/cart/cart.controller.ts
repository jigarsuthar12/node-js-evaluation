import { CartEntity, CartItemEntity, ProductEntity, ReviewEntity, UserEntity } from "@entities";
import { InitRepository, InjectRepositories } from "@helpers";
import { TRequest, TResponse } from "@types";
import { Repository } from "typeorm";

interface IReviewParams {
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

  @InitRepository(CartItemEntity)
  cartItemRepository: Repository<CartItemEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public get = async (req: TRequest, res: TResponse) => {
    const cart = await this.cartRepository.findOne({ where: { userId: req.me.id } });
    if (!cart) {
      return res.status(404).json({ msg: "CAN_NOT_GET_ANY_CART" });
    }

    const cartItems = await this.cartItemRepository.find({
      relations: {
        product: {
          reviews: {
            user: true,
          },
        },
      },
    });

    const mappedCartItems = cartItems.map(item => {
      const mappedProduct = item.product.reviews;
      const avgRating = mappedProduct.length > 0 ? mappedProduct.reduce((acc, review) => acc + review.rating, 0) / item.product.reviews.length : 0;

      return { ...item, avgRating };
    });

    if (!cart) {
      return res.status(404).json({ msg: "CAN_NOT_GET_ANY_CART" });
    }
    return res.status(200).json({ msg: "GOT_CART_ITEMS", Cart: mappedCartItems });
  };

  public create = async (req: TRequest, res: TResponse) => {
    const { productId } = req.params as IReviewParams;

    const cart = await this.cartRepository.findOne({ where: { userId: req.me.id } });
    if (!cart) {
      const newCart = await this.cartRepository.create({ userId: Number(req.me.id) });
      await this.cartRepository.save(newCart);

      const cartItem = await this.cartItemRepository.create({ productId: Number(productId), cartId: newCart.id });
      await this.cartItemRepository.save(cartItem);

      return res.status(201).json({ msg: "CART_ADDED" });
    }
    const cartItemProduct = await this.cartItemRepository.findOne({ where: { productId, cartId: cart.id } });
    if (cartItemProduct) {
      cartItemProduct.quantity += 1;
      await this.cartItemRepository.save(cartItemProduct);
      return res.status(200).json({ msg: "CART_ADDED" });
    }

    const cartItem = await this.cartItemRepository.create({ productId: Number(productId), cartId: cart.id });
    await this.cartItemRepository.save(cartItem);

    return res.status(201).json({ msg: "CART_ADDED" });
  };

  public deleteFromCart = async (req: TRequest, res: TResponse) => {
    const { productId } = req.params as IReviewParams;
    const cart = await this.cartRepository.findOne({ where: { userId: req.me.id } });
    if (!cart) {
      return res.status(404).json({ msg: "CAN_NOT_GET_YOUR_CART" });
    }
    const cartItem = await this.cartItemRepository.findOne({ where: { cartId: cart.id, productId } });
    if (cartItem.quantity) {
      cartItem.quantity -= 1;
      this.cartItemRepository.save(cartItem);
      return res.status(200).json({ msg: "PRODUCT_FROM_CART_DELETED" });
    }
    await this.cartItemRepository.delete({ productId, cartId: cart.id });
    return res.status(200).json({ msg: "PRODUCT_FROM_CART_DELETED" });
  };
}
