import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { User } from "@prisma/client";
import { GetUser } from "src/auth/decorator/getUser.decorator";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { ConfigService } from "src/config/config.service";
import { CreateReverseShareDTO } from "./dto/createReverseShare.dto";
import { ReverseShareDTO } from "./dto/reverseShare.dto";
import { ReverseShareTokenWithShares } from "./dto/reverseShareTokenWithShares";
import { UpdateReverseShareDTO } from "./dto/updateReverseShare.dto";
import { ReverseShareOwnerGuard } from "./guards/reverseShareOwner.guard";
import { ReverseShareService } from "./reverseShare.service";

@Controller("reverseShares")
export class ReverseShareController {
  constructor(
    private reverseShareService: ReverseShareService,
    private config: ConfigService,
  ) {}

  @Post()
  @UseGuards(JwtGuard)
  async create(@Body() body: CreateReverseShareDTO, @GetUser() user: User) {
    const token = await this.reverseShareService.create(body, user.id);

    const link = `${this.config.get("general.appUrl")}/upload/${token}`;

    return { token, link };
  }

  @Throttle({
    default: {
      limit: 20,
      ttl: 60,
    },
  })
  @Get(":reverseShareToken")
  async getByToken(@Param("reverseShareToken") reverseShareToken: string) {
    const isValid = await this.reverseShareService.isValid(reverseShareToken);

    if (!isValid) throw new NotFoundException("Reverse share token not found");

    return new ReverseShareDTO().from(
      await this.reverseShareService.getByToken(reverseShareToken),
    );
  }

  @Get(":reverseShareId/files")
  @UseGuards(JwtGuard, ReverseShareOwnerGuard)
  async getFiles(@Param("reverseShareId") id: string) {
    return this.reverseShareService.getFiles(id);
  }

  @Get(":reverseShareId/share-id")
  @UseGuards(JwtGuard, ReverseShareOwnerGuard)
  async getShareId(@Param("reverseShareId") id: string) {
    const share = await this.reverseShareService.getOrCreateShareForReverseShare(id);
    return { shareId: share.id };
  }

  @Get()
  @UseGuards(JwtGuard)
  async getAllByUser(@GetUser() user: User) {
    return new ReverseShareTokenWithShares().fromList(
      await this.reverseShareService.getAllByUser(user.id),
    );
  }

  @Delete(":reverseShareId")
  @UseGuards(JwtGuard, ReverseShareOwnerGuard)
  async remove(@Param("reverseShareId") id: string) {
    await this.reverseShareService.remove(id);
  }

  @Get(":reverseShareId/files/:fileId/share-id")
  @UseGuards(JwtGuard, ReverseShareOwnerGuard)
  async getShareIdByFile(
    @Param("reverseShareId") id: string,
    @Param("fileId") fileId: string,
  ) {
    return this.reverseShareService.getShareIdByFile(id, fileId);
  }

  @Delete(":reverseShareId/files/:fileId")
  @UseGuards(JwtGuard, ReverseShareOwnerGuard)
  async deleteFile(
    @Param("reverseShareId") id: string,
    @Param("fileId") fileId: string,
  ) {
    const share = await this.reverseShareService.getOrCreateShareForReverseShare(id);
    await this.reverseShareService.deleteFile(share.id, fileId);
  }

  @Patch(":reverseShareId")
  @UseGuards(JwtGuard, ReverseShareOwnerGuard)
  async update(
    @Param("reverseShareId") id: string,
    @Body() body: UpdateReverseShareDTO,
  ) {
    await this.reverseShareService.update(id, body);
  }
}
