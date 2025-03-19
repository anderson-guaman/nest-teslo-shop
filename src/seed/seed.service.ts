import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { Any } from 'typeorm';

@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService
  ){}

  async runSeed(){
    const productsDeleted = await this.insertNewProducts()
    return productsDeleted 
              ? 'SEED EXECUTE'
              : 'SEED DID NOT EXECUTE'
  }

  private async insertNewProducts(){
    this.productService.deleteAllProducts()
    const products = initialData.products;
    // await products.forEach( product =>{
    //   this.productService.create( product )
    // })

    const insertPromises: Promise<any>[] = [] ;
    products.forEach( product => {
      insertPromises.push( this.productService.create( product ) );
    });

    await Promise.all( insertPromises );
    return true
  }
}
