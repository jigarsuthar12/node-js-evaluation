import { ProductEntity, ReviewEntity, UserEntity } from "@entities";
import { AvgRating, InitRepository, InjectRepositories } from "@helpers";
import { ECategory, TRequest, TResponse } from "@types";
import { Between, FindOperator, LessThanOrEqual, Like, MoreThanOrEqual, Repository } from "typeorm";
import { CreateProductDto, UpdateProductDto } from "./dto";

interface IProductQueryParams {
  allProducts?: string;
  name?: string;
  category?: ECategory;
  minPrice?: number;
  maxPrice?: number;
  discount?: string;
  minRating?: number;
  maxRating?: number;
  sortBy?: "priceLowToHigh" | "priceHighToLow" | "name";
}

type TWhereClause<T> = Partial<{
  [K in keyof T]: T[K] | FindOperator<T[K]>;
}>;

type TProduct = {
  category?: ECategory;
  name?: string;
  price?: number;
  rating?: number;
  discount?: string;
};
export class ProductController {
  @InitRepository(ProductEntity)
  productRepository: Repository<ProductEntity>;

  @InitRepository(ReviewEntity)
  reviewRepository: Repository<ReviewEntity>;

  @InitRepository(UserEntity)
  userRepository: Repository<UserEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public getDetails = async (req: TRequest, res: TResponse) => {
    const { productId } = req.params;
    const product = await this.productRepository.findOne({ relations: { reviews: { user: true } }, where: { id: Number(productId) } });
    if (!product) {
      return res.status(404).json({ msg: "CAN_NOT_GET_ANY_PRODUCT" });
    }
    const avgRating = await AvgRating.getAvgRating(product.reviews);
    const updatedReview = await Promise.all(
      product.reviews.map(async item => {
        const user = await this.userRepository.findOne({ where: { id: item.userId } });
        return { ...item, username: user.name };
      }),
    );
    return res.status(200).json({ msg: "PRODUCT_DETAIL", ...product, reviews: updatedReview, avgRating });
  };

  public getTrendingList = async (req: TRequest, res: TResponse) => {
    const products = await this.productRepository.find({
      relations: {
        reviews: {
          user: true,
        },
      },
      order: {
        id: "DESC",
      },
      take: 5,
    });
    const updatedProducts = await Promise.all(
      products.map(async item => {
        const avgRating = await AvgRating.getAvgRating(item.reviews);
        return { ...item, avgRating };
      }),
    );
    return res.status(200).json({ msg: "TRENDING ITEMS", updatedProducts });
  };

  public get = async (req: TRequest, res: TResponse) => {
    const { allProducts, name, category, minPrice, maxPrice, sortBy, minRating, maxRating, discount } = req.query as IProductQueryParams;

    const where: TWhereClause<TProduct> = {};
    if (allProducts === "true") {
      const products = await this.productRepository.find({
        relations: {
          reviews: { user: true },
        },
      });
      const updatedProducts = await Promise.all(
        products.map(async item => {
          const avgRating = await AvgRating.getAvgRating(item.reviews);
          return { ...item, avgRating };
        }),
      );
      return res.status(200).json({ msg: "ALL PRODUCTS", updatedProducts });
    }
    if (category && name) {
      where.category = category;
      where.name = Like(`%${name}%`);
    }
    if (category) {
      where.category = category;
    }
    if (name) {
      where.name = Like(`%${name}%`);
    }

    const order: { [key: string]: "ASC" | "DESC" } = {};
    if (sortBy === "priceLowToHigh") {
      order.price = "ASC";
    }
    if (sortBy === "priceHighToLow") {
      order.price = "DESC";
    }
    if (sortBy === "name") {
      order.name = "ASC";
    }
    if (minPrice && maxPrice) {
      where.price = Between(minPrice, maxPrice);
    }
    if (minPrice) {
      where.price = MoreThanOrEqual(minPrice);
    }
    if (maxPrice) {
      where.price = LessThanOrEqual(maxPrice);
    }
    if (discount) {
      where.discount = discount;
    }
    const products = await this.productRepository.find({ relations: { reviews: { user: true } }, where, order });
    const updatedProducts = await Promise.all(
      products.map(async item => {
        const avgRating = await AvgRating.getAvgRating(item.reviews);
        return { ...item, avgRating };
      }),
    );

    if (minRating || maxRating) {
      const productsWithReviews = await this.productRepository.find({
        relations: { reviews: { user: true } },
      });

      const filteredProducts = productsWithReviews.filter(product => {
        const { reviews } = product;
        const avgRating = reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0;

        if (minRating && maxRating) {
          return avgRating >= minRating && avgRating <= maxRating;
        }
        if (minRating) {
          return avgRating >= minRating;
        }
        if (maxRating) {
          return avgRating <= maxRating;
        }
        return true;
      });

      const ratingProducts = filteredProducts.map(product => ({
        ...product,
        avgRating: AvgRating.getAvgRating(product.reviews),
      }));

      return res.status(200).json({ msg: "ALL FILTERED RATING PRODUCTS", products: ratingProducts });
    }
    return res.status(200).json({ msg: "ALL FILTERED RATING PRODUCTS", updatedProducts });
  };

  public create = async (req: TRequest<CreateProductDto>, res: TResponse) => {
    const { name, price, imageUrl, description, discount, category } = req.dto as CreateProductDto;
    const product = this.productRepository.create({ name, price, imageUrl, description, discount, category });
    await this.productRepository.save(product);

    return res.status(201).json({ msg: "PRODUCT_CREATED" });
  };

  public update = async (req: TRequest<UpdateProductDto>, res: TResponse) => {
    const { name, price, imageUrl, description, discount, category } = req.dto as UpdateProductDto;
    const { productId } = req.params;
    await this.productRepository.update({ id: parseInt(productId, 10) }, { name, price, imageUrl, description, discount, category });

    res.status(200).json({ msg: "PRODUCT_UPDATED" });
  };
}
