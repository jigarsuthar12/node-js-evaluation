import { Constants } from "@configs";
import { Category } from "@types";
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from "class-validator";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(Constants.NAME_LENGTH)
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
