import { Min } from 'class-validator';
import { CreateCatInput } from '../../schema/auto.generated.graphql.schema';

export class CreateCatDto extends CreateCatInput {
  @Min(1)
  age: number;

  name: string;
}
