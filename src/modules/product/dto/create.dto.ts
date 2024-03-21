import { Constants } from "@configs";
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from "class-validator";

enum Category {
  MOBILE = "Mobile",
  COMPUTER = "Computer",
  BOOKS = "Books",
  CAR = "Car",
  GROCERY = "Grocery",
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(Constants.NAME)
  name: string;

  @IsInt()
  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  imageUrl: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  discount: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(Category)
  category: Category;
}
