import { Constants } from "@configs";
import { ECategory } from "@types";
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
  @IsEnum(ECategory)
  category: ECategory;
}
