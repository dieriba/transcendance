import {
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CustomUploadFileTypeValidator,
  VALID_UPLOADS_MIME_TYPES,
  MAX_PROFILE_PICTURE_SIZE_IN_BYTES,
} from './validator/file.validator';
import { PublicRoute } from 'src/common/custom-decorator/metadata.decorator';
import { LibService } from 'src/lib/lib.service';
@Controller('upload-files')
export class UploadFilesController {
  constructor(private readonly libService: LibService) {}
  @Post()
  @PublicRoute()
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
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
          fileIsRequired: false,
        }),
    )
    file: Express.Multer.File,
  ) {
    return { message: 'File uploaded succesfully' };
  }
}
