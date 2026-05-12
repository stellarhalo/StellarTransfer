import { IsBoolean, IsString, IsOptional } from "class-validator";

export class CreateReverseShareDTO {
  @IsBoolean()
  sendEmailNotification: boolean;

  @IsString()
  maxShareSize: string;

  @IsString()
  shareExpiration: string;

  @IsBoolean()
  simplified: boolean;

  @IsBoolean()
  publicAccess: boolean;

  @IsOptional()
  @IsString()
  name?: string;
}
