import { BadRequestException } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class UserDto {
  @Transform(({ value }) => {
    if (!parseInt(value)) {
      throw new BadRequestException('id is not a number');
    }
    return parseInt(value);
  })
  readonly id: number;

  @IsNotEmpty()
  readonly name: string;

  @IsNotEmpty()
  readonly password: string;

  readonly email: string;

  constructor(id: number, name: string, email: string, password: string) {
    this.id = id;
    this.name = name;
    this.password = password;
    this.email = email;
  }
}
