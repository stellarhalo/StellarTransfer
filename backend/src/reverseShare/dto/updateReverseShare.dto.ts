import { IsString, IsOptional } from "class-validator";

export class UpdateReverseShareDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  shareExpiration?: string;

  @IsOptional()
  @IsString()
  maxShareSize?: string;
}