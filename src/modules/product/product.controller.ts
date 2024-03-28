import { ProductEntity, ReviewEntity, UserEntity } from "@entities";
import { InitRepository, InjectRepositories } from "@helpers";
import { Category, TRequest, TResponse } from "@types";
import { Between, FindOperator, LessThanOrEqual, Like, MoreThanOrEqual, Repository } from "typeorm";
import { CreateProductDto, UpdateProductDto } from "./dto";

interface ProductQueryParams {
  allProducts?: string;
  name?: string;
  category?: Category;
  minPrice?: number;
  maxPrice?: number;
  discount?: string;
  minRating?: number;
  maxRating?: number;
  sortBy?: "priceLowToHigh" | "priceHighToLow" | "name";
}

type WhereClause<T> = Partial<{
  [K in keyof T]: T[K] | FindOperator<T[K]>;
}>;

type Product = {
  category?: Category;
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
    const product = await this.productRepository.findOne({ where: { id: Number(productId) } });
    const reviews = await this.reviewRepository.find({ where: { productId: product.id } });
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    const updatedReview = await Promise.all(
      reviews.map(async item => {
        const user = await this.userRepository.findOne({ where: { id: item.userId } });
        return { ...item, username: user.name };
      }),
    );
    return res.status(200).json({ msg: "PRODUCT_DETAIL", ...product, reviews: updatedReview, avgRating });
  };

  public getTrendingList = async (req: TRequest, res: TResponse) => {
    const products = await this.productRepository.find({
      order: {
        id: "DESC",
      },
      take: 5,
    });
    const updatedProducts = await Promise.all(
      products.map(async item => {
        const reviews = await this.reviewRepository.find({ where: { productId: item.id } });
        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        const updatedReviews = await Promise.all(
          reviews.map(async reviewItem => {
            const user = await this.userRepository.findOne({ where: { id: reviewItem.userId } });
            return { ...reviewItem, username: user.name };
          }),
        );
        return { ...item, reviews: updatedReviews, avgRating };
      }),
    );
    return res.status(200).json({ msg: "TRENDING ITEMS", updatedProducts });
  };

  public get = async (req: TRequest, res: TResponse) => {
    const { allProducts, name, category, minPrice, maxPrice, sortBy, minRating, maxRating, discount } = req.query as ProductQueryParams;

    const where: WhereClause<Product> = {};
    if (allProducts === "true") {
      const products = await this.productRepository.find();
      const updatedProducts = await Promise.all(
        products.map(async item => {
          const reviews = await this.reviewRepository.find({ where: { productId: item.id } });
          const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
          const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;
          const updatedReviews = await Promise.all(
            reviews.map(async reviewItem => {
              const user = await this.userRepository.findOne({ where: { id: reviewItem.userId } });
              return { ...reviewItem, username: user.name };
            }),
          );
          return { ...item, reviews: updatedReviews, avgRating };
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
    const products = await this.productRepository.find({ where, order });
    const updatedProducts = await Promise.all(
      products.map(async item => {
        const reviews = await this.reviewRepository.find({ where: { productId: item.id } });

        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

        const updatedReviews = await Promise.all(
          reviews.map(async reviewItem => {
            const user = await this.userRepository.findOne({ where: { id: reviewItem.userId } });
            return { ...reviewItem, username: user.name };
          }),
        );
        return { ...item, reviews: updatedReviews, avgRating };
      }),
    );

    if (minRating && maxRating) {
      const ratingProducts = await this.productRepository
        .createQueryBuilder("product")
        .leftJoin("product.reviews", "review")
        .select("product.id, product.name, AVG(review.rating) as avgRating")
        .groupBy("product.id")
        .having("AVG(review.rating) BETWEEN :minRating AND :maxRating", { minRating, maxRating })
        .getRawMany();

      const updatedRatingProducts = await Promise.all(
        ratingProducts.map(async item => {
          const reviews = await this.reviewRepository.find({ where: { productId: item.id } });
          const updatedReviews = await Promise.all(
            reviews.map(async reviewItem => {
              const user = await this.userRepository.findOne({ where: { id: reviewItem.userId } });
              return { ...reviewItem, username: user.name };
            }),
          );
          return { ...item, reviews: updatedReviews };
        }),
      );
      return res.status(200).json({ msg: "ALL FILTERED RATING PRODUCTS", updatedRatingProducts });
    }
    if (maxRating) {
      const ratingProducts = await this.productRepository
        .createQueryBuilder("product")
        .leftJoin("product.reviews", "review")
        .select("product.id, product.name, AVG(review.rating) as avgRating")
        .groupBy("product.id")
        .having("AVG(review.rating) <= :maxRating", { maxRating })
        .getRawMany();

      const updatedRatingProducts = await Promise.all(
        ratingProducts.map(async item => {
          const reviews = await this.reviewRepository.find({ where: { productId: item.id } });
          const updatedReviews = await Promise.all(
            reviews.map(async reviewItem => {
              const user = await this.userRepository.findOne({ where: { id: reviewItem.userId } });
              return { ...reviewItem, username: user.name };
            }),
          );
          return { ...item, reviews: updatedReviews };
        }),
      );
      return res.status(200).json({ msg: "ALL FILTERED RATING PRODUCTS", updatedRatingProducts });
    }
    if (minRating) {
      const ratingProducts = await this.productRepository
        .createQueryBuilder("product")
        .leftJoin("product.reviews", "review")
        .select("product.id, product.name, AVG(review.rating) as avgRating")
        .groupBy("product.id")
        .having("AVG(review.rating) >= :minRating", { minRating })
        .getRawMany();

      const updatedRatingProducts = await Promise.all(
        ratingProducts.map(async item => {
          const reviews = await this.reviewRepository.find({ where: { productId: item.id } });
          const updatedReviews = await Promise.all(
            reviews.map(async reviewItem => {
              const user = await this.userRepository.findOne({ where: { id: reviewItem.userId } });
              return { ...reviewItem, username: user.name };
            }),
          );
          return { ...item, reviews: updatedReviews };
        }),
      );
      return res.status(200).json({ msg: "ALL FILTERED RATING PRODUCTS", updatedRatingProducts });
    }
    return res.status(200).json({ msg: "ALL FILTERED PRODUCTS", updatedProducts });
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
    this.productRepository.update({ id: parseInt(productId, 10) }, { name, price, imageUrl, description, discount, category });

    res.status(200).json({ msg: "PRODUCT_UPDATED" });
  };
}
