import { Module } from '@nestjs/common';
import { UploadFilesService } from './upload-files.service';
import { UploadFilesController } from './upload-files.controller';
import { LibModule } from 'src/lib/lib.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [LibModule, PrismaModule],
  exports: [UploadFilesService],
  controllers: [UploadFilesController],
  providers: [UploadFilesService],
})
export class UploadFilesModule {}
