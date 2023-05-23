import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { Public } from '../../../core/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import * as fs from 'fs';
import * as mime from 'mime-types';
@Controller('api/')
export class FileUploadController {
  @Public()
  @Get('file/:filename')
  getFile(@Param('filename') filename: string, @Res() res) {
    const filePath = join(__dirname, '../../../../files', filename);
    console.log(filePath);
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      res.send(fileContent);
    } else {
      res.status(404).send('File not found');
    }
    // return res.sendFile(filename, { root: './files' });
  }
  @Public()
  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          console.log(file);
          const filename = `${Date.now()}.${file.mimetype.split('/')[1]}`;
          return cb(null, filename);
        },
      }),
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    const fileType = mime.lookup(file.originalname);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(fileType)) {
      throw new Error(
        'Invalid file type. Only JPEG and PNG files are allowed.',
      );
    }
    return { file };
  }

  @Public()
  @Delete('file/:filename')
  async delete(@Param('filename') filename: string) {
    const path = './files/' + filename;
    try {
      await fs.promises.unlink(path);
      return { message: 'File deleted successfully' };
    } catch (err) {
      console.error(err);
      throw new Error('Failed to delete file');
    }
  }
}
