import { forwardRef, Module } from "@nestjs/common";
import { FileModule } from "src/file/file.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { ReverseShareController } from "./reverseShare.controller";
import { ReverseShareOwnerGuard } from "./guards/reverseShareOwner.guard";
import { ReverseShareService } from "./reverseShare.service";

@Module({
  imports: [forwardRef(() => FileModule), PrismaModule],
  controllers: [ReverseShareController],
  providers: [ReverseShareService, ReverseShareOwnerGuard],
  exports: [ReverseShareService],
})
export class ReverseShareModule {}
