import { SetMetadata } from '@nestjs/common';

export const IS_JWT_PUBLIC_KEY = 'IS_JWT_PUBLIC_KEY';
export const Public = () => SetMetadata(IS_JWT_PUBLIC_KEY, true);
