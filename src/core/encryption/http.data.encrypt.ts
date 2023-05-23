import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class HttpDataEncryptMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: any) {
    res.on('finish', () => {
      const secretKey = 'my-secret-key'; // Replace with your own secret key
      const algorithm = 'aes-256-cbc'; // Replace with your preferred encryption algorithm
      const iv = crypto.randomBytes(16); // Generate a random initialization vector

      const encryptedData =
        crypto
          .createCipheriv(algorithm, secretKey, iv)
          .update(res.locals.data, 'utf8', 'hex') +
        crypto.createCipheriv(algorithm, secretKey, iv).final('hex');

      res.locals.data = {
        encryptedData,
        iv: iv.toString('hex'),
      };
    });

    next();
  }
}
