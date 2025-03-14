import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  // se define las entidades que se estan definiendo 
  imports:[TypeOrmModule.forFeature([
    Product
  ])]
})
export class ProductsModule {}
