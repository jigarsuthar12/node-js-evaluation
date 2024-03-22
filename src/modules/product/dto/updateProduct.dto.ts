import { Constants } from "@configs";
import { Category } from "@types";
import { IsEnum, IsInt, IsOptional, IsString, IsUrl, MaxLength } from "class-validator";

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @MaxLength(Constants.NAME_LENGTH)
  name: string;

  @IsInt()
  @IsOptional()
  price: number;

  @IsString()
  @IsUrl()
  @IsOptional()
  imageUrl: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsOptional()
  @IsString()
  discount: string;

  @IsString()
  @IsOptional()
  @IsEnum(Category)
  category: Category;
}
