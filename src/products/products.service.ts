
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

import { PaginationDto } from 'src/common/dtos/pagination.dto';


@Injectable()
export class ProductsService {

  // pinta un error en consola de forma bonita 
  private readonly logger = new Logger('ProductsService');

  constructor(
    // Inyectamos un repositorio, se trabaja con el patron repositorio 
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ){}


  async create(createProductDto: CreateProductDto) {
    try {
      // crea y almacecena el producto mientras no se de save no se guarda en la base 
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product)
      return product; // retorna el producto creado todo los campos de la tabla como el id y demas 
    } catch (error) {
      this.handleExeptions(error)
    }
  }


  findAll( paginationDto: PaginationDto ) {
    //offset: salta n registros y trae los proximos limit registros
    // en este caso lo vamos a usar como offset:page
    const { limit=10, offset=1 }= paginationDto;
    return this.productRepository.find({
      take: limit,
      skip: (offset * limit) - limit
      //TODO: relaciones
    });
  }

  async findOne(filtro: string) {
    let product: Product | null = null;

    //find with id
    if( !isNaN(+filtro) ){
      product = await this.productRepository.findOne({
        where:{ id : +filtro}
      });
    }else{ // find wit sql query
      const queryBuilder = this.productRepository.createQueryBuilder(); // proteccion contra query inyeccion
      product = await queryBuilder
        .where( 'UPPER(title) =:title or slug =:slug',{
          title: filtro.toUpperCase(),
          slug: filtro.toLowerCase(),
        }).getOne();
    }
    
    // // find with slug
    // if( product === null ){
    //   product = await this.productRepository.findOne({
    //     where: { slug: filtro}
    //   });
    // }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      // primero busca un product por el id y prepara el producto para actualizarce
      const product = await this.productRepository.preload({
        id:id,
        ...updateProductDto
      });
      if( product ){
        await this.productRepository.save(product);
      }
      return product;
    } catch (error) {
      this.handleExeptions(error)
    }
  }

  async remove(id: number) {
    const product = await this.productRepository.findOne({ where: { id:+id } })
    if( product )
      await this.productRepository.remove( product );
    return product;
  }

  private handleExeptions( error: any ){
    if ( error.code === '23505' )
      throw new BadRequestException(error.detail);

    this.logger.error(error); // solo muestra el error en consolosa de manera estilisada
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
