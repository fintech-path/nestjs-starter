import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/restful/auth/auth.module';
import { OpenapiModule } from 'src/modules/restful/openapi/openapi.module';
import { UserModule } from 'src/modules/restful/user/user.module';
import { MonitorModule } from 'src/modules/restful/monitor/monitor.module';
import { FileUploadModule } from 'src/modules/restful/fileupload/file.upload.module';

@Module({
  imports: [
    AuthModule,
    OpenapiModule,
    UserModule,
    MonitorModule,
    FileUploadModule,
  ],
})
export class RestfulModule {}
