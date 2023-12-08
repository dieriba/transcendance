import { ResponseMessageInterceptor } from './../common/global-interceptros/response.interceptor';
import {
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CustomUploadFileTypeValidator,
  MAX_PROFILE_PICTURE_SIZE_IN_BYTES,
} from './validator/file.validator';
import { LibService } from 'src/lib/lib.service';
import { VALID_UPLOADS_MIME_TYPES } from '../../shared/constant';
import { ResponseMessage } from 'src/common/custom-decorator/respone-message.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator';
import { UserNotFoundException } from 'src/common/custom-exception/user-not-found.exception';

@Controller('files')
export class UploadFilesController {
  constructor(
    private readonly libService: LibService,
    private readonly prismaService: PrismaService,
  ) {}
  @Put('upload-avatar')
  @ResponseMessage('File uploaded succesfully')
  @UseInterceptors(ResponseMessageInterceptor)
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @GetUser('userId') userId: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addValidator(
          new CustomUploadFileTypeValidator({
            fileType: VALID_UPLOADS_MIME_TYPES,
          }),
        )
        .addMaxSizeValidator({ maxSize: MAX_PROFILE_PICTURE_SIZE_IN_BYTES })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    const user = await this.prismaService.user.findFirst({
      where: { id: userId },
      include: {
        profile: {
          select: {
            avatar: true,
          },
        },
      },
    });

    if (!user) throw new UserNotFoundException();

    const avatartPath = user.profile.avatar;

    const fullPath = process.env.BACKEND_DOMAIN_AVATAR + '/' + avatartPath;

    if (avatartPath) {
      this.libService.deleteFile(fullPath);
    }

    const avatar =
      process.env.BACKEND_DOMAIN_AVATAR +
      this.libService.createFile(process.env.AVATAR_UPLOAD_PATH, file);

    await this.prismaService.profile.update({
      where: {
        userId,
      },
      data: {
        avatar,
      },
    });

    return avatar;
  }
}
