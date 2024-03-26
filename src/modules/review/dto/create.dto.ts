import { Constants } from "@configs";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateReviewDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @IsOptional()
  @Min(Constants.MIN_RATING)
  @Max(Constants.MAX_RATING)
  rating?: number;
}
