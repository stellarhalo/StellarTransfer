import { BadRequestException, Injectable } from "@nestjs/common";
import * as moment from "moment";
import { ConfigService } from "src/config/config.service";
import { FileService } from "src/file/file.service";
import { PrismaService } from "src/prisma/prisma.service";
import { parseRelativeDateToAbsolute } from "src/utils/date.util";
import { CreateReverseShareDTO } from "./dto/createReverseShare.dto";

@Injectable()
export class ReverseShareService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private fileService: FileService,
  ) {}

  async create(data: CreateReverseShareDTO, creatorId: string) {
    // Parse date string to date
    const expirationDate = moment()
      .add(
        data.shareExpiration.split("-")[0],
        data.shareExpiration.split(
          "-",
        )[1] as moment.unitOfTime.DurationConstructor,
      )
      .toDate();

    const parsedExpiration = parseRelativeDateToAbsolute(data.shareExpiration);
    const maxExpiration = this.config.get("share.maxExpiration");
    if (
      maxExpiration.value !== 0 &&
      parsedExpiration >
        moment().add(maxExpiration.value, maxExpiration.unit).toDate()
    ) {
      throw new BadRequestException(
        "Expiration date exceeds maximum expiration date",
      );
    }

    const globalMaxShareSize = this.config.get("share.maxSize");

    if (globalMaxShareSize > 0 && globalMaxShareSize < data.maxShareSize)
      throw new BadRequestException(
        `Max share size can't be greater than ${globalMaxShareSize} bytes.`,
      );

    const reverseShare = await this.prisma.reverseShare.create({
      data: {
        shareExpiration: expirationDate,
        maxShareSize: data.maxShareSize,
        sendEmailNotification: data.sendEmailNotification,
        remainingUses: 1,
        simplified: data.simplified,
        publicAccess: data.publicAccess,
        name: data.name || null,
        creator: {
          connect: { id: creatorId },
        },
      },
    });

    return reverseShare.token;
  }

  async getByToken(reverseShareToken?: string) {
    if (!reverseShareToken) return null;

    const reverseShare = await this.prisma.reverseShare.findUnique({
      where: { token: reverseShareToken },
    });

    return reverseShare;
  }

  async getAllByUser(userId: string) {
    const reverseShares = await this.prisma.reverseShare.findMany({
      where: {
        creatorId: userId,
        shareExpiration: { gt: new Date() },
      },
      orderBy: {
        shareExpiration: "desc",
      },
      include: { shares: { include: { creator: true, files: true } } },
    });

    // Calculate current size for each reverse share
    return reverseShares.map((rs) => {
      let currentSize = 0;
      for (const share of rs.shares) {
        for (const file of share.files) {
          currentSize += parseInt(file.size) || 0;
        }
      }
      return {
        ...rs,
        currentSize,
      };
    });
  }

  async isValid(reverseShareToken: string) {
    const reverseShare = await this.prisma.reverseShare.findUnique({
      where: { token: reverseShareToken },
    });

    if (!reverseShare) return false;

    const isExpired = new Date() > reverseShare.shareExpiration;

    return !isExpired;
  }

  async remove(id: string) {
    const shares = await this.prisma.share.findMany({
      where: { reverseShare: { id } },
    });

    for (const share of shares) {
      await this.prisma.share.delete({ where: { id: share.id } });
      await this.fileService.deleteAllFiles(share.id);
    }

    await this.prisma.reverseShare.delete({ where: { id } });
  }

  async getOrCreateShareForReverseShare(id: string) {
    const reverseShare = await this.prisma.reverseShare.findUnique({
      where: { id },
      include: {
        shares: true,
      },
    });

    if (!reverseShare) throw new BadRequestException("Reverse share not found");

    if (reverseShare.shares.length > 0) {
      return reverseShare.shares[0];
    }

    const expirationDate = reverseShare.shareExpiration;
    const storageProvider = this.config.get("s3.enabled") ? "S3" : "LOCAL";

    const newShare = await this.prisma.share.create({
      data: {
        expiration: expirationDate,
        reverseShare: {
          connect: { id },
        },
        storageProvider,
      },
    });

    return newShare;
  }

  async getFiles(id: string) {
    const reverseShare = await this.prisma.reverseShare.findUnique({
      where: { id },
      include: {
        shares: {
          include: {
            files: true,
          },
        },
      },
    });

    if (!reverseShare) return [];

    const files: Array<{ id: string; name: string; size: string; shareId: string; shareName: string | null }> = [];

    for (const share of reverseShare.shares) {
      for (const file of share.files) {
        files.push({
          id: file.id,
          name: file.name,
          size: file.size,
          shareId: share.id,
          shareName: share.name || null,
        });
      }
    }

    return files;
  }

  async getShareIdByFile(reverseShareId: string, fileId: string) {
    const share = await this.prisma.reverseShare.findUnique({
      where: { id: reverseShareId },
      include: {
        shares: {
          include: {
            files: true,
          },
        },
      },
    });

    if (!share) throw new BadRequestException("Reverse share not found");

    for (const s of share.shares) {
      for (const file of s.files) {
        if (file.id === fileId) {
          return { shareId: s.id, fileId: file.id };
        }
      }
    }

    throw new BadRequestException("File not found");
  }

  async deleteFile(shareId: string, fileId: string) {
    await this.prisma.file.delete({ where: { id: fileId } });
    await this.fileService.deleteAllFiles(shareId);
  }

  async update(id: string, data: { name?: string; shareExpiration?: string; maxShareSize?: string }) {
    const updateData: any = {};

    if (data.name !== undefined) {
      updateData.name = data.name || null;
    }

    if (data.shareExpiration !== undefined) {
      const expirationDate = moment()
        .add(
          data.shareExpiration.split("-")[0],
          data.shareExpiration.split("-")[1] as moment.unitOfTime.DurationConstructor,
        )
        .toDate();
      updateData.shareExpiration = expirationDate;
    }

    if (data.maxShareSize !== undefined) {
      updateData.maxShareSize = data.maxShareSize;
    }

    await this.prisma.reverseShare.update({
      where: { id },
      data: updateData,
    });
  }
}
