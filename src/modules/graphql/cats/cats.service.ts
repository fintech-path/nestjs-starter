import { Injectable } from '@nestjs/common';
import { Cat } from '../schema/auto.generated.graphql.schema';

@Injectable()
export class CatsService {
  private cats: Array<Cat & { ownerId?: number }> = [
    { id: 1, name: 'Cat', age: 5, ownerId: 1 },
  ];

  create(cat: Cat): Cat {
    cat.id = this.cats.length + 1;
    this.cats.push(cat);
    return cat;
  }

  findAll(): Cat[] {
    return this.cats;
  }

  findOneById(id: number): Cat {
    return this.cats.find((cat) => cat.id === id);
  }

  deleteCat(id: number): Cat {
    if (id < 0) {
      return null;
    }
    const cat = this.findOneById(id);
    this.cats = this.cats.filter((cat) => {
      return cat.id != id;
    });
    return cat;
  }
}
