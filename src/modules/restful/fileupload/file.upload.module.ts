import { FileUploadController } from './file.uplod.controller';

import { Module } from '@nestjs/common';

@Module({
  controllers: [FileUploadController],
})
export class FileUploadModule {}
