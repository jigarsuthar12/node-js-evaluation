import { Constants } from "@configs";
import { ECategory } from "@types";
import { IsEnum, IsInt, IsString, IsUrl, MaxLength } from "class-validator";

export class UpdateProductDto {
  @IsString()
  @MaxLength(Constants.NAME_LENGTH)
  name: string;

  @IsInt()
  price: number;

  @IsString()
  @IsUrl()
  imageUrl: string;

  @IsString()
  description: string;

  @IsString()
  discount: string;

  @IsString()
  @IsEnum(ECategory)
  category: ECategory;
}
