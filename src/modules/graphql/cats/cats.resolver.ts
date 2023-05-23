import { Inject, Injectable, ParseIntPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { Cat } from '../schema/auto.generated.graphql.schema';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Public } from 'src/core/decorators/public.decorator';

const pubSub = new PubSub();

@Resolver('Cat')
@Injectable()
export class CatsResolver {
  constructor(
    private readonly catsService: CatsService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Public()
  @Query('cats')
  async getCats() {
    return this.catsService.findAll();
  }

  @Query('cat')
  async findOneById(
    @Args('id', ParseIntPipe)
    id: number,
  ): Promise<Cat> {
    return this.catsService.findOneById(id);
  }

  @Public()
  @Mutation('createCat')
  async create(@Args('createCatInput') args: CreateCatDto): Promise<Cat> {
    const createdCat = await this.catsService.create(args);
    pubSub.publish('catCreated', { catCreated: createdCat });
    return createdCat;
  }

  @Mutation('deleteCat')
  async delete(@Args('id', ParseIntPipe) id: number): Promise<Cat> {
    return await this.catsService.deleteCat(id);
  }

  @Public()
  @Subscription('catCreated')
  catCreated() {
    return pubSub.asyncIterator('catCreated');
  }
}
