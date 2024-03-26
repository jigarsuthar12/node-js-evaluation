import { ProductEntity } from "@entities";
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
  rating?: number;
  discount?: string;
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

  constructor() {
    InjectRepositories(this);
  }

  public getTrendingList = async (req: TRequest, res: TResponse) => {
    const products = await this.productRepository.find({
      order: {
        id: "DESC",
      },
      take: 5,
    });

    return res.status(200).json({ msg: "TRENDING ITEMS", products });
  };

  public get = async (req: TRequest, res: TResponse) => {
    const { allProducts, name, category, minPrice, maxPrice, sortBy, discount } = req.query as ProductQueryParams;

    const where: WhereClause<Product> = {};
    if (allProducts === "true") {
      const products = await this.productRepository.find();
      return res.status(200).json({ msg: "ALL PRODUCTS", products });
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
    return res.status(200).json({ msg: "ALL FILTERED PRODUCTS", products });
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
